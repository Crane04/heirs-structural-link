import type { Request, Response } from 'express';
import { HttpError } from '../errors/HttpError';
import { createClaimForPhone, getClaimOrThrow } from '../services/claimService';
import { analyseWithAi } from '../services/aiService';
import { createDamageReport, getReportByClaimObjectId } from '../services/reportService';
import { sendWhatsApp, buildClaimReadyMessage, buildFraudFlagMessage } from '../notify';
import { clearSession } from '../session';
import { generateFunSummary } from '../services/insightService';

const SUPPORTED_MODELS = new Set(['Toyota Camry', 'Honda Accord', 'Lexus RX']);

export async function getClaim(req: Request, res: Response) {
  const claim = await getClaimOrThrow(req.params.id);
  res.json(claim);
}

export async function analyseClaim(req: Request, res: Response) {
  const { frameUrls, carModel } = req.body as { frameUrls?: string[]; carModel?: string };
  if (!frameUrls || frameUrls.length === 0) throw new HttpError(400, 'No frameUrls provided');
  if (!carModel) throw new HttpError(400, 'No carModel provided');
  if (!SUPPORTED_MODELS.has(carModel)) throw new HttpError(400, 'Unsupported car model');

  console.log(`[AnalyseClaim] Received analysis request for claim ${req.params.id} with model ${carModel} and frames:`, frameUrls);

  const claim = await getClaimOrThrow(req.params.id);

  claim.status = 'processing';
  claim.carModel = carModel;
  await claim.save();

  const ai = await analyseWithAi(frameUrls, carModel);

  const report = await createDamageReport({
    claimObjectId: claim._id,
    predictions: ai.predictions,
    totalPayoutNgn: ai.totalPayoutNgn,
    fraudFlagged: ai.fraudFlagged,
  });

  claim.status = ai.fraudFlagged ? 'flagged' : 'complete';
  await claim.save();

  const whatsappTo = `whatsapp:${claim.phoneNumber}`;
  const { summary } = await generateFunSummary({
    fraudFlagged: ai.fraudFlagged,
    totalPayoutNgn: ai.totalPayoutNgn,
    claimId: String(claim._id),
    predictions: ai.predictions,
  });
  if (ai.fraudFlagged) {
    await sendWhatsApp(whatsappTo, buildFraudFlagMessage(ai.predictions, summary));
  } else {
    await sendWhatsApp(whatsappTo, buildClaimReadyMessage(String(claim._id), ai.totalPayoutNgn, ai.predictions, summary));
  }

  res.json({ reportId: report._id, fraudFlagged: ai.fraudFlagged });
}

export async function getReport(req: Request, res: Response) {
  const claim = await getClaimOrThrow(req.params.claimId);
  const report = await getReportByClaimObjectId(claim._id);
  if (!report) throw new HttpError(404, 'Report not found');
  res.json(report);
}

export async function acceptReport(req: Request, res: Response) {
  const claim = await getClaimOrThrow(req.params.claimId);
  const report = await getReportByClaimObjectId(claim._id);
  if (!report) throw new HttpError(404, 'Report not found');

  report.acceptedAt = new Date();
  await report.save();

  await clearSession(claim.phoneNumber);
  await sendWhatsApp(
    `whatsapp:${claim.phoneNumber}`,
    `🎉 *Payout accepted!*\n\n` +
      `Your claim has been approved. Heirs Insurance will process your payment shortly.\n\n` +
      `Thank you for using Heirs Structural-Link AI. Drive safe! 🚗`
  );

  res.json({ success: true, acceptedAt: report.acceptedAt });
}

export async function sandboxAnalyse(req: Request, res: Response) {
  const { frameUrl, carModel } = req.body as {
    frameUrl?: string;
    carModel?: string;
  };

  if (!frameUrl) throw new HttpError(400, 'No frameUrl provided');
  if (!carModel) throw new HttpError(400, 'No carModel provided');
  if (!SUPPORTED_MODELS.has(carModel)) throw new HttpError(400, 'Unsupported car model');
  const { claim } = await createClaimForPhone('+00000000000');

  claim.status = 'processing';
  claim.carModel = carModel;
  await claim.save();

  const ai = await analyseWithAi([frameUrl], carModel);

  const report = await createDamageReport({
    claimObjectId: claim._id,
    predictions: ai.predictions,
    totalPayoutNgn: ai.totalPayoutNgn,
    fraudFlagged: ai.fraudFlagged,
  });

  claim.status = ai.fraudFlagged ? 'flagged' : 'complete';
  await claim.save();

  const { summary } = await generateFunSummary({
    fraudFlagged: ai.fraudFlagged,
    totalPayoutNgn: ai.totalPayoutNgn,
    claimId: String(claim._id),
    predictions: ai.predictions,
  });

  res.json({
    claimId: String(claim._id),
    reportId: String(report._id),
    fraudFlagged: ai.fraudFlagged,
    totalPayoutNgn: ai.totalPayoutNgn,
    predictions: ai.predictions,
    summary,
  });
}
