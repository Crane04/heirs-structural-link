import { groqChatComplete } from './groqService';
import { formatConciseSummary } from '../notify';

type Prediction = {
  zone?: string;
  damageType?: string;
  severity?: string;
  dentDepthCm?: number;
  payoutParts?: string;
  componentsAtRisk?: string;
  fraudFlagged?: boolean;
  confidence?: number;
};

function sanitizePredictions(predictions: Prediction[], maxItems = 6) {
  return (predictions || [])
    .slice(0, maxItems)
    .map((p) => ({
      zone: p.zone,
      damageType: p.damageType,
      severity: p.severity,
      dentDepthCm: p.dentDepthCm,
      payoutParts: p.payoutParts,
      componentsAtRisk: p.componentsAtRisk,
      fraudFlagged: p.fraudFlagged,
      confidence: p.confidence,
    }));
}

export async function generateFunSummary(input: {
  fraudFlagged: boolean;
  totalPayoutNgn: number;
  claimId?: string;
  predictions: Prediction[];
}): Promise<{ summary: string; source: 'groq' | 'fallback' }> {
  // Always keep a deterministic fallback for reliability.
  const fallback = formatConciseSummary({
    fraudFlagged: input.fraudFlagged,
    totalPayoutNgn: input.totalPayoutNgn,
    claimId: input.claimId,
    predictions: input.predictions,
  });

  try {
    const status = input.fraudFlagged ? 'FLAGGED' : 'COMPLETE';
    const payout = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(input.totalPayoutNgn);

    const payload = {
      status,
      payout,
      claimId: input.claimId,
      faults: sanitizePredictions(input.predictions),
    };

    const content = await groqChatComplete({
      temperature: 0.95, // encourage different wordings
      maxTokens: 130,
      timeoutMs: 7000,
      messages: [
        {
          role: 'system',
          content:
            'You rewrite structured vehicle damage results into a short, friendly, layman summary. ' +
            'Rules: keep it concise (2-4 lines). No medical/legal claims. No guarantees. ' +
            'Do not mention "YOLO", "MiDaS", "model", or any internal tooling. ' +
            'Avoid raw centimetre numbers; use plain words like light/moderate/deep dent. ' +
            'Always include Status and payout. If FLAGGED, say it needs manual review.',
        },
        { role: 'user', content: `Summarize this JSON:\n${JSON.stringify(payload)}` },
      ],
    });

    // Ensure required fields appear even if the model gets creative.
    const mustHave = `Status: ${status}`;
    const ensured = content.includes('Status:') ? content : `${mustHave}\n${content}`;
    const ensured2 = ensured.includes('₦') || ensured.includes('NGN') ? ensured : `${ensured}\n${payout}`;

    return { summary: ensured2.trim(), source: 'groq' };
  } catch {
    return { summary: fallback, source: 'fallback' };
  }
}

