import mongoose from "mongoose";

const StarSchema = new mongoose.Schema(
  {
    catalogId: { type: String, index: true },
    baseName: String,              // e.g. Vega
    displayName: String,           // e.g. Nour
    ra: Number,
    dec: Number,
    magnitude: Number,
    constellation: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isGifted: { type: Boolean, default: false },
    certificateStyle: {
      type: String,
      enum: ["classic", "modern", "cosmic"],
      default: "classic",
    },
  },
  { timestamps: true }
);

StarSchema.index({ owner: 1 });
StarSchema.index({ displayName: "text", baseName: "text", constellation: "text" });

export default mongoose.models.Star || mongoose.model("Star", StarSchema);
