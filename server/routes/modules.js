import { Router } from "express";
import Module from "../models/Module.js";
import Subject from "../models/Subject.js";

const router = Router();

// List modules (optionally by subjectId)
router.get("/", async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    const filter = subjectId ? { subjectId } : {};
    const modules = await Module.find(filter).sort({ display_order: 1, createdAt: -1 }).lean();
    return res.json(
      modules.map((m) => ({
        id: m._id.toString(),
        subject_id: m.subjectId.toString(),
        name: m.name,
        description: m.description || "",
        display_order: m.display_order || 0,
        topics: [],
      }))
    );
  } catch (err) {
    return next(err);
  }
});

// Create module
router.post("/", async (req, res, next) => {
  try {
    const { name, description, subject_id, display_order } = req.body;
    if (!name || !subject_id) {
      return res.status(400).json({ error: "name and subject_id are required" });
    }
    const subject = await Subject.findById(subject_id);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    const created = await Module.create({
      name,
      description,
      subjectId: subject_id,
      display_order: display_order ?? 0,
    });

    return res.status(201).json({
      id: created._id.toString(),
      subject_id: created.subjectId.toString(),
      name: created.name,
      description: created.description || "",
      display_order: created.display_order || 0,
      topics: [],
    });
  } catch (err) {
    return next(err);
  }
});

// Update module
router.patch("/:id", async (req, res, next) => {
  try {
    const { name, description, subject_id, display_order } = req.body;
    if (subject_id) {
      const subject = await Subject.findById(subject_id);
      if (!subject) return res.status(404).json({ error: "Subject not found" });
    }

    const updated = await Module.findByIdAndUpdate(
      req.params.id,
      {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(subject_id ? { subjectId: subject_id } : {}),
        ...(display_order !== undefined ? { display_order } : {}),
      },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: "Module not found" });

    return res.json({
      id: updated._id.toString(),
      subject_id: updated.subjectId.toString(),
      name: updated.name,
      description: updated.description || "",
      display_order: updated.display_order || 0,
      topics: [],
    });
  } catch (err) {
    return next(err);
  }
});

// Delete module
router.delete("/:id", async (req, res, next) => {
  try {
    await Module.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
