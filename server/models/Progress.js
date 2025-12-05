import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    smartScore: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    questionsAttempted: { type: Number, default: 0 },
    questionsCorrect: { type: Number, default: 0 },
    timeSpentSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProgressSchema.index({ userId: 1, subjectId: 1 }, { unique: true });

export default mongoose.model("Progress", ProgressSchema);
