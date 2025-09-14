import mongoose from "mongoose";

const StarSchema = new mongoose.Schema(
  {
    catalogId:   { type: String, required: true, unique: true, index: true },
    name:        { type: String, default: null },
    baseName:    { type: String, required: true },  
    displayName: { type: String },                  
    story:       { type: String, default: null },
    ra: Number,
    dec: Number,
    magnitude: Number,
    constellation: String,
    nakedEye:   { type: Boolean, default: false },
  binocular:  { type: Boolean, default: false },

  owner:   { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  pendingOwnerEmail: { type: String, default: null, index: true },
  isGifted:{ type: Boolean, default: false },

    certificateStyle: {
      type: String,
      enum: ["classic", "modern", "cosmic"],
      default: "classic"
    }
  },
  { timestamps: true }
);

StarSchema.index({ owner: 1, updatedAt: -1 });
StarSchema.index({ magnitude: 1 });
StarSchema.index({ pendingOwnerEmail: 1 });
StarSchema.index({ nakedEye: 1, binocular: 1 });
StarSchema.index(
  { displayName: "text", baseName: "text", constellation: "text" },
  { weights: { displayName: 5, baseName: 3, constellation: 1 } }
);

export default mongoose.models.Star || mongoose.model("Star", StarSchema);
