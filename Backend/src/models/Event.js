import mongoose from "mongoose";
const { Schema } = mongoose;

const EventSchema = new Schema({
  source:     { type: String, required: true, index: true }, 
  externalId: { type: String, required: true, index: true }, 
  title:      { type: String, required: true },
  description:{ type: String, default: "" },
  startTime:  { type: Date, required: true, index: true },
  endTime:    { type: Date, default: null },
  meta:       { type: Object }, 
}, { timestamps: true });

EventSchema.index({ source: 1, externalId: 1 }, { unique: true });

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
