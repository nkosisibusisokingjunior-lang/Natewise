import mongoose from "mongoose";

const TopicSchema = new mongoose.Schema(
  {
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    display_order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

TopicSchema.index({ moduleId: 1, display_order: 1 });

export default mongoose.model("Topic", TopicSchema);
