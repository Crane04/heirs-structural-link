import mongoose, { Document, Schema } from 'mongoose';

export interface IClaim extends Document {
  phoneNumber: string;
  status: 'initiated' | 'scanning' | 'processing' | 'complete' | 'flagged';
  carMake?: string;
  carModel?: string;
  claimUrl: string;
  createdAt: Date;
}

const ClaimSchema = new Schema<IClaim>({
  phoneNumber: { type: String, required: true },
  status: {
    type: String,
    enum: ['initiated', 'scanning', 'processing', 'complete', 'flagged'],
    default: 'initiated',
  },
  carMake:  { type: String },
  carModel: { type: String },
  claimUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IClaim>('Claim', ClaimSchema);
