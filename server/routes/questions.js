import { Router } from "express";
import Question from "../models/Question.js";
import Skill from "../models/Skill.js";

const router = Router();

// List questions (optionally by skillId)
router.get("/", async (req, res, next) => {
  try {
    const { skillId } = req.query;
    const filter = skillId ? { skillId } : {};
    const questions = await Question.find(filter).lean();
    return res.json(
      questions.map((q) => ({
        id: q._id.toString(),
        skill_id: q.skillId?.toString(),
        subject_id: q.subjectId?.toString(),
        question_text: q.prompt,
        question_data: { options: q.options?.map((o) => o.value) || [] },
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

// Create question
router.post("/", async (req, res, next) => {
  try {
    const {
      skill_id,
      subject_id,
      question_text,
      question_data,
      correct_answer,
      explanation,
      difficulty_rating,
      points_value,
    } = req.body;

    if (!skill_id || !question_text || !correct_answer) {
      return res.status(400).json({ error: "skill_id, question_text, and correct_answer are required" });
    }

    const skill = await Skill.findById(skill_id);
    if (!skill) return res.status(404).json({ error: "Skill not found" });

    const optionsArray =
      question_data?.options && Array.isArray(question_data.options)
        ? question_data.options
            .filter((o) => typeof o === "string" && o.trim() !== "")
            .map((value) => ({ value }))
        : [];

    const created = await Question.create({
      skillId: skill_id,
      subjectId: subject_id || null,
      prompt: question_text,
      difficulty: difficulty_rating ?? 1,
      options: optionsArray,
      answer: correct_answer,
      explanation,
      points_value: points_value ?? 0,
      image_url: question_data?.image_url || "",
      mermaid: question_data?.mermaid || "",
    });

    return res.status(201).json({
      id: created._id.toString(),
      skill_id: created.skillId.toString(),
      subject_id: created.subjectId?.toString(),
      question_text: created.prompt,
      question_data: {
        options: created.options?.map((o) => o.value) || [],
        image_url: created.image_url || "",
        mermaid: created.mermaid || "",
      },
      correct_answer: created.answer,
      explanation: created.explanation || "",
      difficulty_rating: created.difficulty || 1,
      points_value: created.points_value || 0,
    });
  } catch (err) {
    return next(err);
  }
});

// Delete question
router.delete("/:id", async (req, res, next) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

// Update question
router.patch("/:id", async (req, res, next) => {
  try {
    const {
      question_text,
      question_data,
      correct_answer,
      explanation,
      difficulty_rating,
      points_value,
    } = req.body;

    const optionsArray =
      question_data?.options && Array.isArray(question_data.options)
        ? question_data.options
            .filter((o) => typeof o === "string" && o.trim() !== "")
            .map((value) => ({ value }))
        : undefined;

    const updated = await Question.findByIdAndUpdate(
      req.params.id,
      {
        ...(question_text ? { prompt: question_text } : {}),
        ...(correct_answer ? { answer: correct_answer } : {}),
        ...(explanation !== undefined ? { explanation } : {}),
        ...(difficulty_rating !== undefined ? { difficulty: difficulty_rating } : {}),
        ...(points_value !== undefined ? { points_value } : {}),
        ...(optionsArray !== undefined ? { options: optionsArray } : {}),
        ...(question_data?.image_url !== undefined
          ? { image_url: question_data.image_url }
          : {}),
        ...(question_data?.mermaid !== undefined ? { mermaid: question_data.mermaid } : {}),
      },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: "Question not found" });

    return res.json({
      id: updated._id.toString(),
      skill_id: updated.skillId?.toString(),
      subject_id: updated.subjectId?.toString(),
      question_text: updated.prompt,
      question_data: { options: updated.options?.map((o) => o.value) || [] },
      question_data: {
        options: updated.options?.map((o) => o.value) || [],
        image_url: updated.image_url || "",
        mermaid: updated.mermaid || "",
      },
      correct_answer: updated.answer,
      explanation: updated.explanation || "",
      difficulty_rating: updated.difficulty || 1,
      points_value: updated.points_value || 0,
    });
  } catch (err) {
    return next(err);
  }
});


export default router;
