import { Router } from "express";
import SkillProgress from "../models/SkillProgress.js";
import Skill from "../models/Skill.js";
import Topic from "../models/Topic.js";
import Module from "../models/Module.js";
import Subject from "../models/Subject.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/stats", requireAuth, async (req, res, next) => {
  try {
    const progresses = await SkillProgress.find({ userId: req.user.id }).lean();
    const skillsPracticing = progresses.filter(
      (p) => (p.questions_attempted || 0) > 0 && !p.is_mastered
    ).length;
    const skillsMastered = progresses.filter((p) => p.is_mastered).length;
    const currentStreak = progresses.reduce(
      (max, p) => Math.max(max, p.current_streak || 0),
      0
    );
    const totalBadges = 0; // achievements not implemented yet

    return res.json({
      skills_practicing: skillsPracticing,
      skills_mastered: skillsMastered,
      current_streak: currentStreak,
      total_badges: totalBadges,
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/recent-skills", requireAuth, async (req, res, next) => {
  try {
    const progresses = await SkillProgress.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    if (!progresses.length) return res.json([]);

    const skillIds = progresses.map((p) => p.skillId);
    const skills = await Skill.find({ _id: { $in: skillIds } }).lean();
    const topicIds = skills.map((s) => s.topicId);
    const topics = await Topic.find({ _id: { $in: topicIds } }).lean();
    const moduleIds = topics.map((t) => t.moduleId);
    const modules = await Module.find({ _id: { $in: moduleIds } }).lean();
    const subjectIds = modules.map((m) => m.subjectId);
    const subjects = await Subject.find({ _id: { $in: subjectIds } }).lean();

    const moduleToSubject = new Map(
      modules.map((m) => [m._id.toString(), m.subjectId.toString()])
    );
    const topicToModule = new Map(
      topics.map((t) => [t._id.toString(), t.moduleId.toString()])
    );
    const subjectMap = new Map(subjects.map((s) => [s._id.toString(), s]));

    const results = progresses.map((p) => {
      const skill = skills.find(
        (s) => s._id.toString() === p.skillId.toString()
      );
      const topic = topics.find(
        (t) => t._id.toString() === skill?.topicId?.toString()
      );
      const moduleId = topic ? topicToModule.get(topic._id.toString()) : null;
      const subjectId = moduleId ? moduleToSubject.get(moduleId) : null;
      const subject = subjectId ? subjectMap.get(subjectId) : null;

      return {
        id: skill?._id.toString() || "",
        name: skill?.name || "Skill",
        smart_score: p.smart_score || 0,
        subject_name: subject?.name || "Subject",
        subject_color: subject?.color || "from-indigo-500 to-purple-500",
      };
    });

    return res.json(results);
  } catch (err) {
    return next(err);
  }
});

export default router;
