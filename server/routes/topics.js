import { Router } from "express";
import Topic from "../models/Topic.js";
import Module from "../models/Module.js";
import Skill from "../models/Skill.js";

const router = Router();

// List topics (optional moduleId filter)
router.get("/", async (req, res, next) => {
  try {
    const { moduleId } = req.query;
    const filter = moduleId ? { moduleId } : {};
    const topics = await Topic.find(filter).sort({ display_order: 1, createdAt: -1 }).lean();
    return res.json(
      topics.map((t) => ({
        id: t._id.toString(),
        module_id: t.moduleId.toString(),
        name: t.name,
        description: t.description || "",
        display_order: t.display_order || 0,
        skills: [],
      }))
    );
  } catch (err) {
    return next(err);
  }
});

// Create topic
router.post("/", async (req, res, next) => {
  try {
    const { name, description, module_id, display_order } = req.body;
    if (!name || !module_id) {
      return res.status(400).json({ error: "name and module_id are required" });
    }
    const module = await Module.findById(module_id);
    if (!module) return res.status(404).json({ error: "Module not found" });

    const created = await Topic.create({
      name,
      description,
      moduleId: module_id,
      display_order: display_order ?? 0,
    });

    return res.status(201).json({
      id: created._id.toString(),
      module_id: created.moduleId.toString(),
      name: created.name,
      description: created.description || "",
      display_order: created.display_order || 0,
      skills: [],
    });
  } catch (err) {
    return next(err);
  }
});

// Delete topic
router.delete("/:id", async (req, res, next) => {
  try {
    await Topic.findByIdAndDelete(req.params.id);
    // also delete child skills
    await Skill.deleteMany({ topicId: req.params.id });
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

// Update topic
router.patch("/:id", async (req, res, next) => {
  try {
    const { name, description, display_order } = req.body;
    const updated = await Topic.findByIdAndUpdate(
      req.params.id,
      {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(display_order !== undefined ? { display_order } : {}),
      },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ error: "Topic not found" });

    return res.json({
      id: updated._id.toString(),
      module_id: updated.moduleId.toString(),
      name: updated.name,
      description: updated.description || "",
      display_order: updated.display_order || 0,
      skills: [],
    });
  } catch (err) {
    return next(err);
  }
});

// List skills for a topic
router.get("/:id/skills", async (req, res, next) => {
  try {
    const skills = await Skill.find({ topicId: req.params.id })
      .sort({ display_order: 1, createdAt: -1 })
      .lean();
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

export default router;
