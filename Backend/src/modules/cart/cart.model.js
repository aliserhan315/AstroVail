import mongoose from "mongoose";
const { Schema } = mongoose;

const CartItemSchema = new Schema({
  starId:         { type: Schema.Types.ObjectId, ref: "Star", required: true },
  qty:            { type: Number, default: 1 },
  priceCents:     { type: Number, default: 0 },
  recipientEmail: { type: String, default: null },
  message:        { type: String, default: null }, 
  certificateStyle: {
    type: String,
    enum: ["classic", "modern", "cosmic"],
    default: "classic",
  },
}, { _id: false });

const CartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  items:  { type: [CartItemSchema], default: [] },
}, { timestamps: true });

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
