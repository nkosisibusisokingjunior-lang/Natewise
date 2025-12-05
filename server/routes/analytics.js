import { Router } from "express";
import SkillProgress from "../models/SkillProgress.js";
import Skill from "../models/Skill.js";
import Topic from "../models/Topic.js";
import Module from "../models/Module.js";
import Subject from "../models/Subject.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/summary", requireAuth, async (req, res, next) => {
  try {
    const progresses = await SkillProgress.find({ userId: req.user.id }).lean();
    const totalQuestions = progresses.reduce(
      (sum, p) => sum + (p.questions_attempted || 0),
      0
    );
    const totalCorrect = progresses.reduce(
      (sum, p) => sum + (p.questions_correct || 0),
      0
    );
    const totalTimeSeconds = progresses.reduce(
      (sum, p) => sum + (p.time_spent_seconds || 0),
      0
    );
    const skillsPracticed = progresses.filter(
      (p) => (p.questions_attempted || 0) > 0
    ).length;
    const skillsMastered = progresses.filter((p) => p.is_mastered).length;
    const skillsProficient = progresses.filter(
      (p) => (p.smart_score || 0) >= 80 && !p.is_mastered
    ).length;

    const hours = Math.floor(totalTimeSeconds / 3600);
    const minutes = Math.floor((totalTimeSeconds % 3600) / 60);

    return res.json({
      total_questions: totalQuestions,
      total_time: {
        hours,
        minutes,
        display: `${hours} hr ${minutes} min`,
      },
      skills_practiced: skillsPracticed,
      skills_mastered: skillsMastered,
      skills_proficient: skillsProficient,
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/subject-breakdown", requireAuth, async (req, res, next) => {
  try {
    const progresses = await SkillProgress.find({ userId: req.user.id }).lean();
    const skillIds = progresses.map((p) => p.skillId);
    const skills = await Skill.find({ _id: { $in: skillIds } }).lean();
    const topicIds = skills.map((s) => s.topicId);
    const topics = await Topic.find({ _id: { $in: topicIds } }).lean();
    const moduleIds = topics.map((t) => t.moduleId);
    const modules = await Module.find({ _id: { $in: moduleIds } }).lean();
    const subjectIds = modules.map((m) => m.subjectId);
    const subjects = await Subject.find({ _id: { $in: subjectIds } }).lean();

    const subjectMap = new Map(subjects.map((s) => [s._id.toString(), s]));
    const moduleToSubject = new Map(modules.map((m) => [m._id.toString(), m.subjectId.toString()]));
    const topicToModule = new Map(topics.map((t) => [t._id.toString(), t.moduleId.toString()]));
    const skillToSubject = new Map(
      skills.map((s) => {
        const moduleId = topicToModule.get(s.topicId.toString());
        const subjectId = moduleId ? moduleToSubject.get(moduleId) : null;
        return [s._id.toString(), subjectId];
      })
    );

    const breakdown = new Map();
    progresses.forEach((p) => {
      const subjectId = skillToSubject.get(p.skillId.toString());
      if (!subjectId) return;
      const subj = subjectMap.get(subjectId);
      if (!subj) return;
      const key = subjectId;
      const current = breakdown.get(key) || {
        subject_name: subj.name,
        skills_practiced: 0,
        skills_mastered: 0,
        skills_proficient: 0,
        average_score_total: 0,
        average_score_count: 0,
        questions_attempted: 0,
        time_spent_seconds: 0,
      };
      const attempted = p.questions_attempted || 0;
      const smart = p.smart_score || 0;
      current.skills_practiced += attempted > 0 ? 1 : 0;
      current.skills_mastered += p.is_mastered ? 1 : 0;
      current.skills_proficient += smart >= 80 && !p.is_mastered ? 1 : 0;
      current.average_score_total += smart;
      current.average_score_count += 1;
      current.questions_attempted += attempted;
      current.time_spent_seconds += p.time_spent_seconds || 0;
      breakdown.set(key, current);
    });

    const result = Array.from(breakdown.values()).map((b) => ({
      subject_name: b.subject_name,
      skills_practiced: b.skills_practiced,
      skills_mastered: b.skills_mastered,
      skills_proficient: b.skills_proficient,
      average_score:
        b.average_score_count > 0
          ? Math.round(b.average_score_total / b.average_score_count)
          : 0,
      questions_attempted: b.questions_attempted,
      time_spent_seconds: b.time_spent_seconds,
    }));

    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

router.get("/recent-skills", requireAuth, async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 10);
    const progresses = await SkillProgress.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();
    const skillIds = progresses.map((p) => p.skillId);
    const skills = await Skill.find({ _id: { $in: skillIds } }).lean();
    const topicIds = skills.map((s) => s.topicId);
    const topics = await Topic.find({ _id: { $in: topicIds } }).lean();
    const moduleIds = topics.map((t) => t.moduleId);
    const modules = await Module.find({ _id: { $in: moduleIds } }).lean();
    const subjectIds = modules.map((m) => m.subjectId);
    const subjects = await Subject.find({ _id: { $in: subjectIds } }).lean();

    const moduleToSubject = new Map(modules.map((m) => [m._id.toString(), m.subjectId.toString()]));
    const topicToModule = new Map(topics.map((t) => [t._id.toString(), t.moduleId.toString()]));
    const subjectMap = new Map(subjects.map((s) => [s._id.toString(), s.name]));

    const results = progresses.map((p) => {
      const skill = skills.find((s) => s._id.toString() === p.skillId.toString());
      const topic = topics.find((t) => t._id.toString() === skill?.topicId?.toString());
      const moduleId = topic ? topicToModule.get(topic._id.toString()) : null;
      const subjectId = moduleId ? moduleToSubject.get(moduleId) : null;
      const subjectName = subjectId ? subjectMap.get(subjectId) || "Subject" : "Subject";

      return {
        skill_name: skill?.name || "Skill",
        subject_name: subjectName,
        smart_score: p.smart_score || 0,
        is_mastered: p.is_mastered || false,
        last_practiced_at: p.updatedAt,
        questions_attempted: p.questions_attempted || 0,
        questions_correct: p.questions_correct || 0,
      };
    });

    return res.json(results);
  } catch (err) {
    return next(err);
  }
});

router.get("/weak-skills-detailed", requireAuth, async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 10);
    const progresses = await SkillProgress.find({
      userId: req.user.id,
      smart_score: { $lt: 70 },
      questions_attempted: { $gt: 0 },
    })
      .sort({ smart_score: 1 })
      .limit(limit)
      .lean();

    const skillIds = progresses.map((p) => p.skillId);
    const skills = await Skill.find({ _id: { $in: skillIds } }).lean();
    const topicIds = skills.map((s) => s.topicId);
    const topics = await Topic.find({ _id: { $in: topicIds } }).lean();
    const moduleIds = topics.map((t) => t.moduleId);
    const modules = await Module.find({ _id: { $in: moduleIds } }).lean();
    const subjectIds = modules.map((m) => m.subjectId);
    const subjects = await Subject.find({ _id: { $in: subjectIds } }).lean();

    const moduleToSubject = new Map(modules.map((m) => [m._id.toString(), m.subjectId.toString()]));
    const topicToModule = new Map(topics.map((t) => [t._id.toString(), t.moduleId.toString()]));
    const subjectMap = new Map(subjects.map((s) => [s._id.toString(), s.name]));

    const results = progresses.map((p) => {
      const skill = skills.find((s) => s._id.toString() === p.skillId.toString());
      const topic = topics.find((t) => t._id.toString() === skill?.topicId?.toString());
      const moduleId = topic ? topicToModule.get(topic._id.toString()) : null;
      const subjectId = moduleId ? moduleToSubject.get(moduleId) : null;
      const subjectName = subjectId ? subjectMap.get(subjectId) || "Subject" : "Subject";

      return {
        skill_name: skill?.name || "Skill",
        subject_name: subjectName,
        smart_score: p.smart_score || 0,
        questions_attempted: p.questions_attempted || 0,
        questions_correct: p.questions_correct || 0,
        questions_missed:
          (p.questions_attempted || 0) - (p.questions_correct || 0),
        last_practiced_at: p.updatedAt,
      };
    });

    return res.json(results);
  } catch (err) {
    return next(err);
  }
});

router.get("/daily-time", requireAuth, async (req, res, next) => {
  try {
    const progresses = await SkillProgress.find({ userId: req.user.id }).lean();
    const byDay = new Map();
    progresses.forEach((p) => {
      const day = (p.updatedAt || p.createdAt).toISOString().slice(0, 10);
      const current = byDay.get(day) || {
        practice_date: day,
        total_seconds: 0,
        skills_practiced: 0,
        questions_attempted: 0,
      };
      current.total_seconds += p.time_spent_seconds || 0;
      current.skills_practiced += (p.questions_attempted || 0) > 0 ? 1 : 0;
      current.questions_attempted += p.questions_attempted || 0;
      byDay.set(day, current);
    });
    return res.json(Array.from(byDay.values()));
  } catch (err) {
    return next(err);
  }
});

export default router;
