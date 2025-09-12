import mongoose from "mongoose";
const { Schema } = mongoose;

const EventReminderSchema = new Schema(
  {
    user:  { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    kind:  { type: String, enum: ["24h", "1h", "custom"], required: true, default: "custom", index: true },
    offsetMin: { type: Number, default: 60 },
    remindAt:  { type: Date, index: true, default: null },
    sentAt:    { type: Date, default: null },

    active: { type: Boolean, default: true },
  },
  { timestamps: true, strict: true }
);

EventReminderSchema.index({ user: 1, event: 1, kind: 1 }, { unique: true });

export default mongoose.models.EventReminder || mongoose.model("EventReminder", EventReminderSchema);
