import mongoose from "mongoose";

const EventReminderSchema = new mongoose.Schema(
  {
    user:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    remindAt: { type: Date, required: true, index: true },
    sent:   { type: Boolean, default: false, index: true }, 
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

EventReminderSchema.index({ user: 1, event: 1 }, { unique: true });

export default mongoose.models.EventReminder || mongoose.model("EventReminder", EventReminderSchema);
