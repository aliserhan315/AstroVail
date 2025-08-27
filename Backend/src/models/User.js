import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String },          
    googleId: { type: String, sparse: true }, 
    displayName: { type: String },
    avatarUrl: { type: String },
    regionCode:  { type: String },
    tz: { type: String },                  
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });


export default mongoose.models.User || mongoose.model("User", UserSchema);
