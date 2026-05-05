import { Claim } from '../db';
import { env } from '../config/env';
import { HttpError } from '../errors/HttpError';

export async function getClaimOrThrow(claimId: string) {
  const claim = await Claim.findById(claimId);
  if (!claim) {
    throw new HttpError(404, 'Claim not found');
  }
  return claim;
}

export async function createClaimForPhone(phoneNumber: string) {
  const claim = await Claim.create({
    phoneNumber,
    status: 'initiated',
    claimUrl: 'pending',
  });

  const claimId = String(claim._id);
  const claimUrl = `${env.WEB_APP_URL}/claim/${claimId}/scan`;
  claim.claimUrl = claimUrl;
  await claim.save();

  return { claim, claimId, claimUrl };
}

