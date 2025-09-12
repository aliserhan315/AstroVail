import mongoose from "mongoose";
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  user:  { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
  type:  { type: String, enum: ["event", "star"], required: true, index: true },
  event: { type: Schema.Types.ObjectId, ref: "Event", index: true, default: null },
  star:  { type: Schema.Types.ObjectId, ref: "Star",  index: true, default: null },
  title: String,
  body:  String,
  day:   { type: String, required: true, index: true }, 
  readAt:{ type: Date, default: null },
}, { timestamps: true });

NotificationSchema.index(
  { user:1, type:1, event:1, day:1 },
  { unique: true, partialFilterExpression: { type: "event", event: { $type: "objectId" } } }
);
NotificationSchema.index(
  { user:1, type:1, star:1, day:1 },
  { unique: true, partialFilterExpression: { type: "star", star: { $type: "objectId" } } }
);

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
