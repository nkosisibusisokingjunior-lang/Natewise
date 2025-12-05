import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
} from "../utils/tokens.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const REFRESH_COOKIE = "refreshToken";
const REFRESH_LIMIT = 5;

function trimRefreshTokens(tokens) {
  const unique = Array.from(new Set(tokens.filter(Boolean)));
  return unique.slice(-REFRESH_LIMIT);
}

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    const user = await User.create({ email, password, role, firstName, lastName });
    const payload = { id: user.id, role: user.role, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshTokens = trimRefreshTokens([...user.refreshTokens, refreshToken]);
    await user.save();

    setRefreshCookie(res, refreshToken);
    return res.status(201).json({ accessToken, user: publicUser(user) });
  } catch (err) {
    return next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const payload = { id: user.id, role: user.role, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshTokens = trimRefreshTokens([...user.refreshTokens, refreshToken]);
    await user.save();

    setRefreshCookie(res, refreshToken);
    return res.json({ accessToken, user: publicUser(user) });
  } catch (err) {
    return next(err);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) return res.status(401).json({ error: "No refresh token" });
    const decoded = verifyRefresh(token);
    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const payload = { id: user.id, role: user.role, email: user.email };
    const accessToken = signAccessToken(payload);

    const newRefreshToken = signRefreshToken(payload);
    user.refreshTokens = trimRefreshTokens(
      [...user.refreshTokens.filter((t) => t !== token), newRefreshToken]
    );
    await user.save();

    setRefreshCookie(res, newRefreshToken);
    return res.json({ accessToken, user: publicUser(user) });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Refresh token expired" });
    }
    return next(err);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      await User.updateOne({ refreshTokens: token }, { $pull: { refreshTokens: token } });
    }
    clearRefreshCookie(res);
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    return res.json({ user: publicUser(user) });
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
});

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
  };
}

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res) {
  res.cookie(REFRESH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export default router;
