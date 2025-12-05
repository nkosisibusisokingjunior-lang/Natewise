import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    display_order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ModuleSchema.index({ subjectId: 1, display_order: 1 });

export default mongoose.model("Module", ModuleSchema);
