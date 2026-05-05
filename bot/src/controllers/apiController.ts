import type { Request, Response } from 'express';
import { HttpError } from '../errors/HttpError';
import { getClaimOrThrow } from '../services/claimService';
import { analyseWithAi } from '../services/aiService';
import { createDamageReport, getReportByClaimObjectId } from '../services/reportService';
import { sendWhatsApp, buildClaimReadyMessage, buildFraudFlagMessage } from '../notify';
import { clearSession } from '../session';

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
  if (ai.fraudFlagged) {
    await sendWhatsApp(whatsappTo, buildFraudFlagMessage());
  } else {
    await sendWhatsApp(whatsappTo, buildClaimReadyMessage(String(claim._id), ai.totalPayoutNgn));
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

