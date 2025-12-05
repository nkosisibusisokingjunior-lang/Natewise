import mongoose from "mongoose";

const LearningPathSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    milestones: [
      {
        title: String,
        description: String,
        status: { type: String, enum: ["pending", "in_progress", "done"], default: "pending" },
      },
    ],
    status: { type: String, enum: ["draft", "active", "completed"], default: "draft" },
  },
  { timestamps: true }
);

export default mongoose.model("LearningPath", LearningPathSchema);
