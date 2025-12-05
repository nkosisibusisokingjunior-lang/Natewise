import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import dashboardRoutes from "./routes/dashboard.js";
import dailyChallengeRoutes from "./routes/dailyChallenges.js";
import subjectsRoutes from "./routes/subjects.js";
import analyticsRoutes from "./routes/analytics.js";
import modulesRoutes from "./routes/modules.js";
import topicsRoutes from "./routes/topics.js";
import skillsRoutes from "./routes/skills.js";
import questionsRoutes from "./routes/questions.js";
import { connectWithRetry, pingDb } from "./utils/db.js";
import achievementsRoutes from "./routes/achievements.js";

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/daily-challenges", dailyChallengeRoutes);
app.use("/api/v1/subjects", subjectsRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/modules", modulesRoutes);
app.use("/api/v1/topics", topicsRoutes);
app.use("/api/v1/skills", skillsRoutes);
app.use("/api/v1/questions", questionsRoutes);
app.use("/api/v1/achievements", achievementsRoutes);

app.get("/api/v1/health", async (_req, res) => {
  const dbHealthy = await pingDb();
  return res.json({ ok: true, db: dbHealthy ? "up" : "down" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

async function start() {
  try {
    await connectWithRetry();
    app.listen(PORT, () => console.log(`API running on :${PORT}`));
  } catch (e) {
    console.error("Failed to start server", e);
    process.exit(1);
  }
}

start();
