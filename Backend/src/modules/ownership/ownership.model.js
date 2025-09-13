import mongoose from 'mongoose';

const { Schema } = mongoose;

const OwnershipRecordSchema = new Schema(
  {
    tokenId: { type: String, index: true },
    wallet: { type: String, index: true },
    email: { type: String, index: true },
    starId: { type: Schema.Types.ObjectId, ref: 'Star', index: true, default: null },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', index: true, default: null },
    txHash: { type: String, index: true },
  },
  { timestamps: true }
);

OwnershipRecordSchema.index({ email: 1, createdAt: -1 });
OwnershipRecordSchema.index({ wallet: 1, createdAt: -1 });
OwnershipRecordSchema.index({ starId: 1 });

export default mongoose.models.OwnershipRecord || mongoose.model('OwnershipRecord', OwnershipRecordSchema);

