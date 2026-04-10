import mongoose, { Document, Schema } from 'mongoose';

export interface IPartsPricing extends Document {
  partName: string;
  priceNgn: number;
  source: string;
  scrapedAt: Date;
}

const PartsPricingSchema = new Schema<IPartsPricing>({
  partName:  { type: String, required: true, index: true },
  priceNgn:  { type: Number, required: true },
  source:    { type: String },
  scrapedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPartsPricing>('PartsPricing', PartsPricingSchema);
