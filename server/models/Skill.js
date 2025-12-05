import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema(
  {
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    difficulty_level: { type: Number, default: 1 },
    display_order: { type: Number, default: 0 },
    mastery_threshold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SkillSchema.index({ topicId: 1, display_order: 1 });

export default mongoose.model("Skill", SkillSchema);
