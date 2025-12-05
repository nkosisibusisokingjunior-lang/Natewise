import { Router } from "express";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return res.json({ user: publicUser(user) });
  } catch (err) {
    return next(err);
  }
});

router.put("/me", requireAuth, async (req, res, next) => {
  try {
    const updates = (({ firstName, lastName }) => ({ firstName, lastName }))(req.body);
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    return res.json({ user: publicUser(user) });
  } catch (err) {
    return next(err);
  }
});

router.get("/", requireAuth, requireRole("admin"), async (_req, res, next) => {
  try {
    const users = await User.find().limit(100);
    return res.json(users.map(publicUser));
  } catch (err) {
    return next(err);
  }
});

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
  };
}

export default router;
