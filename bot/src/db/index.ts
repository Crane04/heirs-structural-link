import mongoose from 'mongoose';

let connectPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(uri: string): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  if (connectPromise) {
    await connectPromise;
    return;
  }
  connectPromise = mongoose.connect(uri);
  await connectPromise;
  connectPromise = null;
  console.log('[DB] MongoDB connected');
}

export { default as Claim } from './models/Claim';
export { default as DamageReport } from './models/DamageReport';
export { default as PartsPricing } from './models/PartsPricing';

export type { IClaim } from './models/Claim';
export type { IDamageReport, IPrediction } from './models/DamageReport';
export type { IPartsPricing } from './models/PartsPricing';
