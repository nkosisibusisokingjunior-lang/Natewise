import { Router } from "express";
import Skill from "../models/Skill.js";
import Topic from "../models/Topic.js";
import Question from "../models/Question.js";
import SkillProgress from "../models/SkillProgress.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";

const router = Router();

// List skills (optional topicId)
router.get("/", async (req, res, next) => {
  try {
    const { topicId } = req.query;
    const filter = topicId ? { topicId } : {};
    const skills = await Skill.find(filter).sort({ display_order: 1, createdAt: -1 }).lean();
    return res.json(
      skills.map((s) => ({
        id: s._id.toString(),
        topic_id: s.topicId.toString(),
        name: s.name,
        description: s.description || "",
        difficulty_level: s.difficulty_level || 1,
        display_order: s.display_order || 0,
        mastery_threshold: s.mastery_threshold || 0,
        questions: [],
      }))
    );
  } catch (err) {
    return next(err);
  }
});

// Get a single skill
router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id).lean();
    if (!skill) return res.status(404).json({ error: "Skill not found" });

    const progress = req.user
      ? await SkillProgress.findOne({ skillId: skill._id, userId: req.user.id }).lean()
      : null;

    return res.json({
      id: skill._id.toString(),
      topic_id: skill.topicId.toString(),
      name: skill.name,
      description: skill.description || "",
      difficulty_level: skill.difficulty_level || 1,
      display_order: skill.display_order || 0,
      mastery_threshold: skill.mastery_threshold || 100,
      smart_score: progress?.smart_score || 0,
      is_mastered: progress?.is_mastered || false,
      questions_attempted: progress?.questions_attempted || 0,
      questions_correct: progress?.questions_correct || 0,
    });
  } catch (err) {
    return next(err);
  }
});

// Create skill
router.post("/", async (req, res, next) => {
  try {
    const { name, description, topic_id, difficulty_level, display_order, mastery_threshold } = req.body;
    if (!name || !topic_id) {
      return res.status(400).json({ error: "name and topic_id are required" });
    }
    const topic = await Topic.findById(topic_id);
    if (!topic) return res.status(404).json({ error: "Topic not found" });

    const created = await Skill.create({
      name,
      description,
      topicId: topic_id,
      difficulty_level: difficulty_level ?? 1,
      display_order: display_order ?? 0,
      mastery_threshold: mastery_threshold ?? 0,
    });

    return res.status(201).json({
      id: created._id.toString(),
      topic_id: created.topicId.toString(),
      name: created.name,
      description: created.description || "",
      difficulty_level: created.difficulty_level || 1,
      display_order: created.display_order || 0,
      mastery_threshold: created.mastery_threshold || 0,
      questions: [],
    });
  } catch (err) {
    return next(err);
  }
});

// Delete skill
router.delete("/:id", async (req, res, next) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    await Question.deleteMany({ skillId: req.params.id });
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

// Update skill
router.patch("/:id", async (req, res, next) => {
  try {
    const { name, description, difficulty_level, display_order, mastery_threshold, topic_id } = req.body;
    if (topic_id) {
      const topic = await Topic.findById(topic_id);
      if (!topic) return res.status(404).json({ error: "Topic not found" });
    }
    const updated = await Skill.findByIdAndUpdate(
      req.params.id,
      {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(difficulty_level !== undefined ? { difficulty_level } : {}),
        ...(display_order !== undefined ? { display_order } : {}),
        ...(mastery_threshold !== undefined ? { mastery_threshold } : {}),
        ...(topic_id ? { topicId: topic_id } : {}),
      },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ error: "Skill not found" });

    return res.json({
      id: updated._id.toString(),
      topic_id: updated.topicId.toString(),
      name: updated.name,
      description: updated.description || "",
      difficulty_level: updated.difficulty_level || 1,
      display_order: updated.display_order || 0,
      mastery_threshold: updated.mastery_threshold || 0,
      questions: [],
    });
  } catch (err) {
    return next(err);
  }
});

// Get questions for a skill
router.get("/:id/questions", async (req, res, next) => {
  try {
    const questions = await Question.find({ skillId: req.params.id }).lean();
    return res.json(
      questions.map((q) => ({
        id: q._id.toString(),
        skill_id: q.skillId?.toString(),
        subject_id: q.subjectId?.toString(),
        question_text: q.prompt,
        question_data: {
          options: q.options?.map((o) => o.value) || [],
          image_url: q.image_url || "",
          mermaid: q.mermaid || "",
        },
        correct_answer: q.answer,
        explanation: q.explanation || "",
        difficulty_rating: q.difficulty || 1,
        points_value: q.points_value || 0,
      }))
    );
  } catch (err) {
    return next(err);
  }
});

// Adaptive questions (basic: return all for now)
router.get("/:id/adaptive-questions", async (req, res, next) => {
  try {
    const questions = await Question.find({ skillId: req.params.id }).lean();
    const mapped = questions.map((q) => ({
      id: q._id.toString(),
      skill_id: q.skillId?.toString(),
      question_text: q.prompt,
      question_data: {
        options: q.options?.map((o) => o.value) || [],
        image_url: q.image_url || "",
        mermaid: q.mermaid || "",
      },
      correct_answer: q.answer,
      explanation: q.explanation || "",
      difficulty_rating: q.difficulty || 1,
      points_value: q.points_value || 0,
    }));
    return res.json({
      questions: mapped,
      current_difficulty: mapped[0]?.difficulty_rating || 1,
      current_smart_score: 0,
      next_difficulty_threshold: 0,
    });
  } catch (err) {
    return next(err);
  }
});

// Next question (simple random)
router.get("/:id/next-question", async (req, res, next) => {
  try {
    const questions = await Question.find({ skillId: req.params.id }).lean();
    if (!questions || questions.length === 0) {
      return res.json({ question: null, difficulty_level: null });
    }
    const random = questions[Math.floor(Math.random() * questions.length)];
    return res.json({
      question: {
        id: random._id.toString(),
        skill_id: random.skillId?.toString(),
        question_text: random.prompt,
        question_data: {
          options: random.options?.map((o) => o.value) || [],
          image_url: random.image_url || "",
          mermaid: random.mermaid || "",
        },
        correct_answer: random.answer,
        explanation: random.explanation || "",
        difficulty_rating: random.difficulty || 1,
        points_value: random.points_value || 0,
      },
      difficulty_level: random.difficulty || 1,
    });
  } catch (err) {
    return next(err);
  }
});

// Progress (placeholder)
router.get("/:id/progress", requireAuth, async (req, res, next) => {
  try {
    const progress = await SkillProgress.findOne({ skillId: req.params.id, userId: req.user.id }).lean();
    if (!progress) {
      return res.json({
        smart_score: 0,
        questions_attempted: 0,
        questions_correct: 0,
        current_streak: 0,
        is_mastered: false,
      });
    }
    return res.json({
      smart_score: progress.smart_score || 0,
      questions_attempted: progress.questions_attempted || 0,
      questions_correct: progress.questions_correct || 0,
      current_streak: progress.current_streak || 0,
      is_mastered: progress.is_mastered || false,
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/:id/progress", requireAuth, async (req, res, next) => {
  try {
    const {
      smart_score = 0,
      questions_attempted = 0,
      questions_correct = 0,
      current_streak = 0,
      is_mastered = false,
      time_spent_seconds = 0,
    } = req.body || {};

    const existing = await SkillProgress.findOne({ skillId: req.params.id, userId: req.user.id });
    if (existing) {
      existing.smart_score = smart_score;
      existing.questions_attempted = questions_attempted;
      existing.questions_correct = questions_correct;
      existing.current_streak = current_streak;
      existing.is_mastered = is_mastered;
      existing.time_spent_seconds =
        (existing.time_spent_seconds || 0) + (Number(time_spent_seconds) || 0);
      await existing.save();
    } else {
      await SkillProgress.create({
        userId: req.user.id,
        skillId: req.params.id,
        smart_score,
        questions_attempted,
        questions_correct,
        current_streak,
        is_mastered,
        time_spent_seconds: Number(time_spent_seconds) || 0,
      });
    }

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
