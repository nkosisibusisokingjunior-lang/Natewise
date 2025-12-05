import { Router } from "express";
import Subject from "../models/Subject.js";
import Module from "../models/Module.js";

const router = Router();

// List subjects
router.get("/", async (_req, res, next) => {
  try {
    const subjects = await Subject.find().lean();
    return res.json(
      subjects.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        code: s.code,
        nated_level: s.level,
        description: s.description || "",
        color_hex: s.color || "",
        is_active: s.isActive,
      }))
    );
  } catch (err) {
    return next(err);
  }
});

// Create subject
router.post("/", async (req, res, next) => {
  try {
    const { name, code, nated_level, description, color_hex } = req.body;
    if (!name || !code || !nated_level) {
      return res.status(400).json({ error: "name, code, and nated_level are required" });
    }
    const existing = await Subject.findOne({ code });
    if (existing) {
      return res.json({
        id: existing._id.toString(),
        name: existing.name,
        code: existing.code,
        nated_level: existing.level,
        description: existing.description || "",
        color_hex: existing.color || "",
        is_active: existing.isActive,
      });
    }

    const created = await Subject.create({
      name,
      code,
      level: nated_level,
      description,
      color: color_hex,
    });

    return res.status(201).json({
      id: created._id.toString(),
      name: created.name,
      code: created.code,
      nated_level: created.level,
      description: created.description || "",
      color_hex: created.color || "",
      is_active: created.isActive,
    });
  } catch (err) {
    return next(err);
  }
});

// Update subject
router.patch("/:id", async (req, res, next) => {
  try {
    const { name, code, nated_level, description, color_hex } = req.body;
    if (code) {
      const conflict = await Subject.findOne({ code, _id: { $ne: req.params.id } });
      if (conflict) return res.status(409).json({ error: "Subject code already exists" });
    }
    const updated = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        ...(name ? { name } : {}),
        ...(code ? { code } : {}),
        ...(nated_level ? { level: nated_level } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(color_hex !== undefined ? { color: color_hex } : {}),
      },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ error: "Subject not found" });
    return res.json({
      id: updated._id.toString(),
      name: updated.name,
      code: updated.code,
      nated_level: updated.level,
      description: updated.description || "",
      color_hex: updated.color || "",
      is_active: updated.isActive,
    });
  } catch (err) {
    return next(err);
  }
});

// Get subject detail (modules empty for now)
router.get("/:id", async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id).lean();
    if (!subject) return res.status(404).json({ error: "Subject not found" });
    const modules = await Module.find({ subjectId: subject._id })
      .sort({ display_order: 1, createdAt: -1 })
      .lean();
    return res.json({
      id: subject._id.toString(),
      name: subject.name,
      code: subject.code,
      nated_level: subject.level,
      description: subject.description || "",
      color_hex: subject.color || "",
      is_active: subject.isActive,
      modules: modules.map((m) => ({
        id: m._id.toString(),
        subject_id: m.subjectId.toString(),
        name: m.name,
        description: m.description || "",
        display_order: m.display_order || 0,
        topics: [],
      })),
    });
  } catch (err) {
    return next(err);
  }
});

// Delete subject
router.delete("/:id", async (req, res, next) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
