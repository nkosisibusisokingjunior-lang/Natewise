import { Router } from "express";
import SkillProgress from "../models/SkillProgress.js";
import Skill from "../models/Skill.js";
import Topic from "../models/Topic.js";
import Module from "../models/Module.js";
import Subject from "../models/Subject.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function buildChallenge(progress, skill, subject) {
  const questionsAttempted = progress?.questions_attempted || 0;
  const questionsCorrect = progress?.questions_correct || 0;
  const today = new Date().toISOString().split("T")[0];
  return {
    id: progress?._id?.toString() || skill?._id?.toString() || "challenge",
    skill_id: skill?._id?.toString() || "",
    skill_name: skill?.name || "Practice",
    subject_name: subject?.name || "Subject",
    questions_required: Math.max(5, Math.min(questionsAttempted + 3, 12)),
    accuracy_required: 70,
    xp_reward: 50,
    questions_completed: questionsAttempted,
    questions_correct: questionsCorrect,
    challenge_date: today,
  };
}

// Current daily challenge: pick the most recently updated skill for the user
router.get("/today", requireAuth, async (req, res, next) => {
  try {
    const progress = await SkillProgress.findOne({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .lean();
    if (!progress) {
      return res.json({ message: "No challenge for today" });
    }
    const skill = await Skill.findById(progress.skillId).lean();
    let subject = null;
    if (skill) {
      const topic = await Topic.findById(skill.topicId).lean();
      const module = topic ? await Module.findById(topic.moduleId).lean() : null;
      subject = module ? await Subject.findById(module.subjectId).lean() : null;
    }
    return res.json(buildChallenge(progress, skill, subject));
  } catch (err) {
    return next(err);
  }
});

// Recent history (placeholder)
router.get("/history", requireAuth, (_req, res) => {
  return res.json([]);
});

// Simple stats (placeholder)
router.get("/stats", requireAuth, async (req, res, next) => {
  try {
    const completedCount = await SkillProgress.countDocuments({
      userId: req.user.id,
      is_mastered: true,
    });
    return res.json({
      total_completed: completedCount,
      current_streak: 0,
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/:id/claim-xp", requireAuth, (_req, res) => {
  // XP ledger not implemented; acknowledge for now.
  return res.json({ success: true, xp_awarded: 50 });
});

export default router;
