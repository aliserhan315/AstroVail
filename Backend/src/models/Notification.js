import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    kind: { type: String, enum: ["event","star","system"], default: "event" },
    title: String,
    body:  String,
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    star:  { type: mongoose.Schema.Types.ObjectId, ref: "Star"  },
    read:  { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
