import mongoose from "mongoose";
const { Schema } = mongoose;

const SessionSchema = new Schema({
  userId:      { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
  sid:         { type: String, unique: true, required: true },  
  refreshHash: { type: String, unique: true, required: true },  
  userAgent:   { type: String },
  ip:          { type: String },
  expiresAt:   { type: Date, index: true, required: true },
}, { timestamps: true });

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Session || mongoose.model("Session", SessionSchema);
