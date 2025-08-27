
import mongoose from "mongoose";
const { Schema } = mongoose;

const OrderItemSchema = new Schema({
  starId:     { type: Schema.Types.ObjectId, ref: "Star", required: true },
  priceCents: { type: Number, required: true },
}, { _id: false });

const OrderSchema = new Schema({
  userId:   { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  items:    { type: [OrderItemSchema], default: [] },
  amount:   { type: Number, required: true },  
  currency: { type: String, default: "USD" },
  status:   { type: String, enum: ["requires_payment","processing","paid","failed","failed_sold_out","canceled","refunded"], default: "requires_payment", index: true },
  stripePaymentIntentId: { type: String },
}, { timestamps: true });

OrderSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
