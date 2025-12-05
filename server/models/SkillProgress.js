import mongoose from "mongoose";

const SkillProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true },
    smart_score: { type: Number, default: 0 },
    questions_attempted: { type: Number, default: 0 },
    questions_correct: { type: Number, default: 0 },
    current_streak: { type: Number, default: 0 },
    is_mastered: { type: Boolean, default: false },
    time_spent_seconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SkillProgressSchema.index({ userId: 1, skillId: 1 }, { unique: true });

export default mongoose.model("SkillProgress", SkillProgressSchema);
