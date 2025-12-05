import mongoose from "mongoose";

const OptionSchema = new mongoose.Schema(
  {
    label: String,
    value: String,
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true },
    prompt: { type: String, required: true },
    difficulty: { type: Number, min: 1, max: 5, default: 1 },
    options: [OptionSchema],
    answer: { type: String, required: true },
    explanation: String,
    points_value: { type: Number, default: 0 },
    image_url: { type: String, default: "" },
    mermaid: { type: String, default: "" },
  },
  { timestamps: true }
);

QuestionSchema.index({ subjectId: 1, difficulty: 1 });
QuestionSchema.index({ skillId: 1 });

export default mongoose.model("Question", QuestionSchema);
