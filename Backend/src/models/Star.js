import mongoose from "mongoose";

const StarSchema = new mongoose.Schema(
  {
    catalogId: { type: String, index: true }, 
    name: { type: String, default: null },
    baseName: String,
    displayName: String,
    ra: Number,          
    dec: Number,         
    magnitude: Number,    
    constellation: String, 
    nakedEye: { type: Boolean, default: false },   
    binocular: { type: Boolean, default: false },  

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isGifted: { type: Boolean, default: false },

    certificateStyle: {
      type: String,
      enum: ["classic", "modern", "cosmic"],
      default: "classic"
    }
  },
  { timestamps: true }
);

StarSchema.index({ owner: 1 });
StarSchema.index({ displayName: "text", baseName: "text", constellation: "text" });
StarSchema.index({ nakedEye: 1, binocular: 1 });   
StarSchema.index({ magnitude: 1 });               

export default mongoose.models.Star || mongoose.model("Star", StarSchema);
