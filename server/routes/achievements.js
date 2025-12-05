import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Basic achievements placeholder so UI doesn't 404.
router.get("/", requireAuth, (_req, res) => {
  return res.json({
    badges: [],
    total_badges: 0,
    total_xp: 0,
    recent: [],
  });
});

router.get("/stats", requireAuth, (_req, res) => {
  return res.json({
    total_badges: 0,
    total_xp: 0,
    streak_days: 0,
  });
});

export default router;
