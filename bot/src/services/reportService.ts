import { DamageReport } from '../db';
import type mongoose from 'mongoose';

export async function createDamageReport(input: {
  claimObjectId: mongoose.Types.ObjectId;
  predictions: any[];
  totalPayoutNgn: number;
  fraudFlagged: boolean;
}) {
  return DamageReport.create({
    claimId: input.claimObjectId,
    predictions: input.predictions,
    totalPayoutNgn: input.totalPayoutNgn,
    fraudFlagged: input.fraudFlagged,
  });
}

export async function getReportByClaimObjectId(claimObjectId: mongoose.Types.ObjectId) {
  return DamageReport.findOne({ claimId: claimObjectId });
}
