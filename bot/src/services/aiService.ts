import { env } from '../config/env';

export type AiAnalyseResult = {
  predictions: any[];
  totalPayoutNgn: number;
  fraudFlagged: boolean;
};

export async function analyseWithAi(frameUrls: string[], carModel: string): Promise<AiAnalyseResult> {
  const res = await fetch(buildAnalyseUrl(env.AI_SERVICE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ frame_urls: frameUrls, car_model: carModel }),
  });

  if (!res.ok) {
    const msg = await safeText(res);
    throw new Error(`[AI] Service error (${res.status}): ${msg || res.statusText}`);
  }

  const data = (await res.json()) as {
    predictions: any[];
    total_payout_ngn: number;
    fraud_flagged: boolean;
  };

  return {
    predictions: data.predictions,
    totalPayoutNgn: data.total_payout_ngn,
    fraudFlagged: data.fraud_flagged,
  };
}

function buildAnalyseUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/+$/, '');

  // Allow configuring either:
  // - AI_SERVICE_URL=http://localhost:8000
  // - AI_SERVICE_URL=http://localhost:8000/analyse
  // - AI_SERVICE_URL=https://<provider>/... (may already include route)
  if (trimmed.toLowerCase().endsWith('/analyse')) return trimmed;

  try {
    const url = new URL(trimmed);
    const path = url.pathname.replace(/\/+$/, '');
    url.pathname = path.endsWith('/analyse') ? path : `${path}/analyse`;
    return url.toString();
  } catch {
    return `${trimmed}/analyse`;
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return '';
  }
}
