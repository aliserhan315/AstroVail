import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, index: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "meteor_shower","eclipse","conjunction","occultation","comet","iss",
        "aurora","solar_flare","solar_cme","other"
      ],
      required: true,
    },
    summary: String,
    start: { type: Date, required: true }, 
    end:   { type: Date },  
    peak:  { type: Date },
    visibility: {
      hemisphere: String, 
    },
    tags: [String],
    source:  String, 
    sourceId: String,
    contentHash: { type: String, index: true },  
  },
  { timestamps: true }
);

EventSchema.index({ start: 1 });                
EventSchema.index({ type: 1, start: 1 });       
EventSchema.index({ source: 1, sourceId: 1 }, { unique: false });

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
