import mongoose from "mongoose";
const { Schema } = mongoose;

const EventReminderSchema = new Schema({
  user:     { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  event:    { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
  offsetMin:{ type: Number, default: 60 }, 
  active:   { type: Boolean, default: true },
}, { timestamps: true });
EventReminderSchema.index({ user:1, event:1 }, { unique: true });

export default mongoose.models.EventReminder || mongoose.model("EventReminder", EventReminderSchema);
