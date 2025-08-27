import mongoose from "mongoose";
const { Schema } = mongoose;

const CartItemSchema = new Schema({
  starId:     { type: Schema.Types.ObjectId, ref: "Star", required: true },
  priceCents: { type: Number, required: true }, 
}, { _id: false });

const CartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", unique: true, index: true, required: true },
  items:  { type: [CartItemSchema], default: [] },
}, { timestamps: true });

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
