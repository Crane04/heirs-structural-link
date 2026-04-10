import mongoose, { Document, Schema } from 'mongoose';

export interface IPrediction {
  zone: string;
  damageType: string;
  confidence: number;
  dentDepthCm: number;
  severity: string;
  hiddenDamage: string;
  componentsAtRisk: string;
  severityScore: number;
  payoutParts: string;
  fraudFlagged: boolean;
}

export interface IDamageReport extends Document {
  claimId: mongoose.Types.ObjectId;
  predictions: IPrediction[];
  totalPayoutNgn: number;
  fraudFlagged: boolean;
  acceptedAt?: Date;
  createdAt: Date;
}

const PredictionSchema = new Schema<IPrediction>({
  zone:             { type: String },
  damageType:       { type: String },
  confidence:       { type: Number },
  dentDepthCm:      { type: Number },
  severity:         { type: String },
  hiddenDamage:     { type: String },
  componentsAtRisk: { type: String },
  severityScore:    { type: Number },
  payoutParts:      { type: String },
  fraudFlagged:     { type: Boolean, default: false },
}, { _id: false });

const DamageReportSchema = new Schema<IDamageReport>({
  claimId:       { type: Schema.Types.ObjectId, ref: 'Claim', required: true },
  predictions:   { type: [PredictionSchema], default: [] },
  totalPayoutNgn:{ type: Number, default: 0 },
  fraudFlagged:  { type: Boolean, default: false },
  acceptedAt:    { type: Date },
  createdAt:     { type: Date, default: Date.now },
});

export default mongoose.model<IDamageReport>('DamageReport', DamageReportSchema);
