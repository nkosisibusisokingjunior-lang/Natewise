import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";

const app = new Hono<{ Bindings: Env }>();

// Add CORS for local development
app.use("/*", cors());

// ============================================================
// AUTHENTICATION ENDPOINTS
// ============================================================

app.get("/api/oauth/google/redirect_url", async (c) => {
  const redirectUrl = await getOAuthRedirectUrl("google", {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });
  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();
  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60,
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const profile = await c.env.DB.prepare(
      "SELECT * FROM user_profiles WHERE user_id = ?"
    ).bind(user.id).first();

    if (!profile) {
      await c.env.DB.prepare(
        "INSERT INTO user_profiles (user_id, role) VALUES (?, ?)"
      ).bind(user.id, "student").run();

      const newProfile = await c.env.DB.prepare(
        "SELECT * FROM user_profiles WHERE user_id = ?"
      ).bind(user.id).first();

      return c.json({ ...user, profile: newProfile });
    }

    return c.json({ ...user, profile });
  } catch (error) {
    console.error("Error fetching user:", error);
    return c.json({ error: "Failed to fetch user" }, 500);
  }
});

app.get("/api/logout", async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === "string") {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// ============================================================
// DASHBOARD ENDPOINTS (NO AUTH FOR DEV)
// ============================================================

app.get("/api/dashboard/stats", async (c) => {
  try {
    const userId = "dev-user"; // Hardcoded for development

    // Count skills with any progress (not mastered)
    const skillsPracticingResult = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM skill_progress WHERE user_id = ? AND is_mastered = 0"
    ).bind(userId).first();

    const skillsPracticing = (skillsPracticingResult as any)?.count || 0;

    // Count mastered skills
    const skillsMasteredResult = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM skill_progress WHERE user_id = ? AND is_mastered = 1"
    ).bind(userId).first();

    const skillsMastered = (skillsMasteredResult as any)?.count || 0;

    // Get max current streak
    const streakResult = await c.env.DB.prepare(
      "SELECT COALESCE(MAX(current_streak), 0) as max_streak FROM skill_progress WHERE user_id = ?"
    ).bind(userId).first();

    const currentStreak = (streakResult as any)?.max_streak || 0;

    // Count achievements
    const badgesResult = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ?"
    ).bind(userId).first();

    const totalBadges = (badgesResult as any)?.count || 0;

    return c.json({
      skills_practicing: skillsPracticing,
      skills_mastered: skillsMastered,
      current_streak: currentStreak,
      total_badges: totalBadges,
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return c.json({ 
      error: "Failed to fetch dashboard stats",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

app.get("/api/dashboard/recent-skills", async (c) => {
  try {
    const userId = "dev-user"; // Hardcoded for development

    const { results } = await c.env.DB.prepare(
      `SELECT 
        sp.skill_id as id,
        s.name,
        sp.smart_score,
        sp.last_practiced_at,
        sub.name as subject_name,
        COALESCE(sub.color_hex, 'from-indigo-500 to-purple-500') as subject_color,
        sub.id as subject_id
       FROM skill_progress sp
       JOIN skills s ON sp.skill_id = s.id
       JOIN topics t ON s.topic_id = t.id
       JOIN modules m ON t.module_id = m.id
       JOIN subjects sub ON m.subject_id = sub.id
       WHERE sp.user_id = ?
       ORDER BY sp.last_practiced_at DESC
       LIMIT 5`
    ).bind(userId).all();

    return c.json(results || []);

  } catch (error) {
    console.error("Recent skills error:", error);
    return c.json({ 
      error: "Failed to fetch recent skills",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ============================================================
// DAILY CHALLENGES ENDPOINTS
// ============================================================

// GET today's challenge (with this user's progress)
app.get("/api/daily-challenges/today", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Using YYYY-MM-DD (same as your challenge_date column)
  const today = new Date().toISOString().slice(0, 10);

  try {
    const challenge = await c.env.DB.prepare(
      `
      SELECT 
        dc.id,
        dc.skill_id,
        s.name AS skill_name,
        sub.name AS subject_name,
        dc.target_questions AS questions_required,
        dc.target_accuracy AS accuracy_required,
        dc.xp_reward,
        dc.challenge_date,
        COALESCE(udc.questions_completed, 0) AS questions_completed,
        COALESCE(udc.questions_correct, 0) AS questions_correct,
        COALESCE(udc.is_completed, 0) AS is_completed,
        udc.completed_at
      FROM daily_challenges dc
      JOIN skills s ON s.id = dc.skill_id
      JOIN topics t ON t.id = s.topic_id
      JOIN modules m ON m.id = t.module_id
      JOIN subjects sub ON sub.id = m.subject_id
      LEFT JOIN user_daily_challenges udc
        ON udc.challenge_id = dc.id AND udc.user_id = ?
      WHERE dc.challenge_date = ?
      `
    )
      .bind(user.id, today)
      .first<{
        id: number;
        skill_id: number;
        skill_name: string;
        subject_name: string;
        questions_required: number;
        accuracy_required: number;
        xp_reward: number;
        challenge_date: string;
        questions_completed: number;
        questions_correct: number;
        is_completed: number;
        completed_at: string | null;
      }>();

    if (!challenge) {
      // No challenge for today
      return c.json({ message: "No challenge for today" }, 404);
    }

    // normalise boolean
    const response = {
      ...challenge,
      is_completed: Boolean(challenge.is_completed),
    };

    return c.json(response, 200);
  } catch (error) {
    console.error("Error fetching today's challenge:", error);
    return c.json(
      { error: "Failed to fetch today's challenge" },
      500
    );
  }
});

// GET history of completed challenges for this user
app.get("/api/daily-challenges/history", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const limitParam = c.req.query("limit");
  const limit = limitParam ? Number(limitParam) : 10;

  try {
    const result = await c.env.DB.prepare(
      `
      SELECT 
        dc.id,
        dc.challenge_date,
        dc.skill_id,
        s.name AS skill_name,
        sub.name AS subject_name,
        dc.target_questions AS questions_required,
        dc.target_accuracy AS accuracy_required,
        dc.xp_reward,
        udc.questions_completed,
        udc.questions_correct,
        udc.is_completed,
        udc.completed_at
      FROM user_daily_challenges udc
      JOIN daily_challenges dc ON dc.id = udc.challenge_id
      JOIN skills s ON s.id = dc.skill_id
      JOIN topics t ON t.id = s.topic_id
      JOIN modules m ON m.id = t.module_id
      JOIN subjects sub ON sub.id = m.subject_id
      WHERE udc.user_id = ?
      ORDER BY dc.challenge_date DESC
      LIMIT ?
      `
    )
      .bind(user.id, limit)
      .all<{
        id: number;
        skill_id: number;
        skill_name: string;
        subject_name: string;
        questions_required: number;
        accuracy_required: number;
        xp_reward: number;
        challenge_date: string;
        questions_completed: number;
        questions_correct: number;
        is_completed: number;
        completed_at: string | null;
      }>();

    const rows = (result.results || []).map((row) => ({
      ...row,
      is_completed: Boolean(row.is_completed),
    }));

    return c.json(rows, 200);
  } catch (error) {
    console.error("Error fetching daily challenge history:", error);
    // Frontend is tolerant of history failure, but we still try to return 200
    return c.json([], 200);
  }
});

// GET stats for this user's daily challenges
app.get("/api/daily-challenges/stats", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const totalCompletedRow = await c.env.DB.prepare(
      `
      SELECT COUNT(*) AS count
      FROM user_daily_challenges
      WHERE user_id = ? AND is_completed = 1
      `
    )
      .bind(user.id)
      .first<{ count: number }>();

    const statsRow = await c.env.DB.prepare(
      `
      SELECT current_weekly_streak
      FROM user_stats
      WHERE user_id = ?
      `
    )
      .bind(user.id)
      .first<{ current_weekly_streak: number }>();

    const totalCompleted = totalCompletedRow?.count ?? 0;
    const currentStreak = statsRow?.current_weekly_streak ?? 0;

    return c.json(
      {
        total_completed: totalCompleted,
        current_streak: currentStreak,
      },
      200
    );
  } catch (error) {
    console.error("Error fetching daily challenge stats:", error);
    return c.json({ error: "Failed to fetch stats" }, 500);
  }
});

// Claim XP for a challenge (if requirements met)
app.post(
  "/api/daily-challenges/:id/claim-xp",
  authMiddleware,
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const challengeId = Number(c.req.param("id"));
    if (!challengeId) {
      return c.json({ error: "Invalid challenge id" }, 400);
    }

    try {
      const row = await c.env.DB.prepare(
        `
        SELECT 
          dc.target_questions,
          dc.target_accuracy,
          dc.xp_reward,
          udc.questions_completed,
          udc.questions_correct,
          udc.is_completed
        FROM daily_challenges dc
        JOIN user_daily_challenges udc
          ON udc.challenge_id = dc.id AND udc.user_id = ?
        WHERE dc.id = ?
        `
      )
        .bind(user.id, challengeId)
        .first<{
          target_questions: number;
          target_accuracy: number;
          xp_reward: number;
          questions_completed: number;
          questions_correct: number;
          is_completed: number;
        }>();

      if (!row) {
        return c.json({ error: "Challenge progress not found" }, 404);
      }

      if (row.is_completed) {
        return c.json({ message: "Already completed" }, 200);
      }

      const accuracy =
        row.questions_completed > 0
          ? (row.questions_correct / row.questions_completed) * 100
          : 0;

      if (
        row.questions_completed < row.target_questions ||
        accuracy < row.target_accuracy
      ) {
        return c.json(
          { error: "Challenge requirements not met yet" },
          400
        );
      }

      // Mark completed & set xp_earned
      await c.env.DB.prepare(
        `
        UPDATE user_daily_challenges
        SET is_completed = 1,
            completed_at = CURRENT_TIMESTAMP,
            xp_earned = ?
        WHERE user_id = ? AND challenge_id = ?
        `
      )
        .bind(row.xp_reward, user.id, challengeId)
        .run();

      // Update user_stats total_xp
      await c.env.DB.prepare(
        `
        UPDATE user_stats
        SET total_xp = total_xp + ?
        WHERE user_id = ?
        `
      )
        .bind(row.xp_reward, user.id)
        .run();

      return c.json(
        { message: "XP claimed!", xp: row.xp_reward },
        200
      );
    } catch (error) {
      console.error("Error claiming XP:", error);
      return c.json({ error: "Failed to claim XP" }, 500);
    }
  }
);


// ============================================================
// SUBJECTS ENDPOINTS
// ============================================================

app.get("/api/subjects", async (c) => {
  try {
    const search = c.req.query("search") || "";
    const level = c.req.query("level") || "";

    let query = "SELECT * FROM subjects WHERE is_active = 1";
    const params: any[] = [];

    if (search) {
      query += " AND (name LIKE ? OR code LIKE ? OR description LIKE ?)";
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (level) {
      query += " AND nated_level = ?";
      params.push(level);
    }

    query += " ORDER BY nated_level, display_order, name";

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    return c.json(results || []);

  } catch (error) {
    console.error("Subjects fetch error:", error);
    return c.json({ 
      error: "Failed to fetch subjects",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

app.get("/api/subjects/:id", async (c) => {
  try {
    const id = c.req.param("id");
    console.log(`Fetching subject ${id}...`);
    
    const subject = await c.env.DB.prepare(
      "SELECT * FROM subjects WHERE id = ? AND is_active = 1"
    ).bind(id).first();

    if (!subject) {
      console.log('Subject not found');
      return c.json({ error: "Subject not found" }, 404);
    }

    console.log('Found subject:', subject.name);

    // Get modules with their topics and skills
    const { results: modules } = await c.env.DB.prepare(
      "SELECT * FROM modules WHERE subject_id = ? AND is_active = 1 ORDER BY display_order, name"
    ).bind(id).all();

    console.log(`Found ${modules?.length || 0} modules`);

    // For each module, get topics and their skills with progress
    const modulesWithContent = await Promise.all(
      (modules || []).map(async (module: any) => {
        console.log(`Processing module: ${module.name} (ID: ${module.id})`);
        
        // Get topics for this module
        const { results: topics } = await c.env.DB.prepare(
          "SELECT * FROM topics WHERE module_id = ? AND is_active = 1 ORDER BY display_order, name"
        ).bind(module.id).all();

        console.log(`Found ${topics?.length || 0} topics for module ${module.id}`);

        // For each topic, get skills with progress
        const topicsWithSkills = await Promise.all(
          (topics || []).map(async (topic: any) => {
            console.log(`Processing topic: ${topic.name} (ID: ${topic.id})`);
            
            const { results: skills } = await c.env.DB.prepare(
              `SELECT 
                s.*, 
                COALESCE(sp.smart_score, 0) as smart_score,
                COALESCE(sp.is_mastered, 0) as is_mastered,
                COALESCE(sp.questions_attempted, 0) as questions_attempted,
                COALESCE(sp.questions_correct, 0) as questions_correct
               FROM skills s 
               LEFT JOIN skill_progress sp ON s.id = sp.skill_id AND sp.user_id = ?
               WHERE s.topic_id = ? AND s.is_active = 1 
               ORDER BY s.display_order, s.name`
            ).bind('dev-user', topic.id).all();

            console.log(`Found ${skills?.length || 0} skills for topic ${topic.id}`);
            
            return { 
              ...topic, 
              skills: skills || [],
              skillCount: skills?.length || 0,
              masteredCount: skills?.filter((s: any) => s.is_mastered).length || 0
            };
          })
        );

        // Calculate module stats
        const allSkills = topicsWithSkills.flatMap((topic: any) => topic.skills);
        const skillCount = allSkills.length;
        const masteredCount = allSkills.filter((skill: any) => skill.is_mastered).length;
        
        return { 
          ...module, 
          topics: topicsWithSkills,
          skillCount,
          masteredCount
        };
      })
    );

    // Calculate subject-wide stats
    const allSkills = modulesWithContent.flatMap((module: any) => 
      module.topics.flatMap((topic: any) => topic.skills)
    );
    const totalSkills = allSkills.length;
    const masteredSkills = allSkills.filter((skill: any) => skill.is_mastered).length;
    const overallSmartScore = totalSkills > 0 
      ? Math.round(allSkills.reduce((sum: number, skill: any) => sum + (skill.smart_score || 0), 0) / totalSkills)
      : 0;

    console.log(`Final result: ${totalSkills} total skills, ${masteredSkills} mastered`);

    return c.json({ 
      ...subject, 
      modules: modulesWithContent,
      totalSkills,
      masteredSkills,
      overallSmartScore
    });

  } catch (error) {
    console.error("Subject detail error:", error);
    return c.json({ 
      error: "Failed to fetch subject",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ============================================================
// MODULES ENDPOINTS
// ============================================================

app.get("/api/modules/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const module = await c.env.DB.prepare(
      "SELECT * FROM modules WHERE id = ? AND is_active = 1"
    ).bind(id).first();

    if (!module) {
      return c.json({ error: "Module not found" }, 404);
    }

    // Get subject info
    const subject = await c.env.DB.prepare(
      "SELECT id, name, code, color_hex FROM subjects WHERE id = ?"
    ).bind((module as any).subject_id).first();

    const { results: topics } = await c.env.DB.prepare(
      "SELECT * FROM topics WHERE module_id = ? AND is_active = 1 ORDER BY display_order, name"
    ).bind(id).all();

    // Get skills for each topic
    const topicsWithSkills = await Promise.all(
      (topics || []).map(async (topic: any) => {
        const { results: skills } = await c.env.DB.prepare(
          "SELECT * FROM skills WHERE topic_id = ? AND is_active = 1 ORDER BY display_order, name"
        ).bind(topic.id).all();
        
        return { ...topic, skills: skills || [] };
      })
    );

    return c.json({ ...module, subject, topics: topicsWithSkills });

  } catch (error) {
    console.error("Module detail error:", error);
    return c.json({ 
      error: "Failed to fetch module",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ============================================================
// SKILLS ENDPOINTS
// ============================================================

app.get("/api/skills/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const skill = await c.env.DB.prepare(
      "SELECT * FROM skills WHERE id = ? AND is_active = 1"
    ).bind(id).first();

    if (!skill) {
      return c.json({ error: "Skill not found" }, 404);
    }

    return c.json(skill);

  } catch (error) {
    console.error("Skill fetch error:", error);
    return c.json({ 
      error: "Failed to fetch skill",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

app.get("/api/skills/:id/questions", async (c) => {
  try {
    const id = c.req.param("id");
    
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM questions WHERE skill_id = ? AND is_active = 1 ORDER BY RANDOM() LIMIT 10"
    ).bind(id).all();

    return c.json(results || []);

  } catch (error) {
    console.error("Questions fetch error:", error);
    return c.json({ 
      error: "Failed to fetch questions",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

app.get("/api/skills/:id/progress", async (c) => {
  try {
    const userId = "dev-user"; // Hardcoded for development
    const skillId = c.req.param("id");

    const progress = await c.env.DB.prepare(
      "SELECT * FROM skill_progress WHERE user_id = ? AND skill_id = ?"
    ).bind(userId, skillId).first();

    if (!progress) {
      // Return default progress if none exists
      return c.json({
        smart_score: 0,
        questions_attempted: 0,
        questions_correct: 0,
        current_streak: 0,
        is_mastered: false,
      });
    }

    return c.json(progress);

  } catch (error) {
    console.error("Skill progress error:", error);
    return c.json({ 
      error: "Failed to fetch skill progress",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", async (c) => {
  try {
    // Test database connection
    const result = await c.env.DB.prepare("SELECT 1 as test").first();
    
    return c.json({ 
      status: "healthy",
      database: result ? "connected" : "error",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ 
      status: "unhealthy",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// ============================================================
// ERROR HANDLER
// ============================================================

app.onError((err, c) => {
  console.error("Application error:", err);
  return c.json({ 
    error: "Internal server error",
    message: err.message,
    timestamp: new Date().toISOString()
  }, 500);
});

// Add these routes to your index.ts after the existing routes

// POST /api/subjects - Create new subject
app.post("/api/subjects", async (c) => {
  try {
    const body = await c.req.json();
    const { name, code, nated_level, description, color_hex, display_order } = body;
    
    const result = await c.env.DB.prepare(
      `INSERT INTO subjects (name, code, nated_level, description, color_hex, display_order) 
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(name, code, nated_level, description, color_hex, display_order || 0).run();
    
    return c.json({ id: result.meta.last_row_id, success: true }, 201);
  } catch (error) {
    console.error("Create subject error:", error);
    return c.json({ error: "Failed to create subject" }, 500);
  }
});

// PATCH /api/subjects/:id - Update subject
app.patch("/api/subjects/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const updates = [];
    const params = [];
    
    if (body.name !== undefined) { updates.push("name = ?"); params.push(body.name); }
    if (body.code !== undefined) { updates.push("code = ?"); params.push(body.code); }
    if (body.nated_level !== undefined) { updates.push("nated_level = ?"); params.push(body.nated_level); }
    if (body.description !== undefined) { updates.push("description = ?"); params.push(body.description); }
    if (body.color_hex !== undefined) { updates.push("color_hex = ?"); params.push(body.color_hex); }
    if (body.display_order !== undefined) { updates.push("display_order = ?"); params.push(body.display_order); }
    if (body.is_active !== undefined) { updates.push("is_active = ?"); params.push(body.is_active); }
    
    if (updates.length === 0) {
      return c.json({ error: "No fields to update" }, 400);
    }
    
    updates.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id);
    
    const query = `UPDATE subjects SET ${updates.join(", ")} WHERE id = ?`;
    await c.env.DB.prepare(query).bind(...params).run();
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Update subject error:", error);
    return c.json({ error: "Failed to update subject" }, 500);
  }
});

// DELETE /api/subjects/:id - Soft delete subject
app.delete("/api/subjects/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await c.env.DB.prepare("UPDATE subjects SET is_active = 0 WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete subject error:", error);
    return c.json({ error: "Failed to delete subject" }, 500);
  }
});
// ============================================================
// ADMIN CONTENT MANAGEMENT ENDPOINTS
// ============================================================

// POST /api/modules - Create module
app.post("/api/modules", async (c) => {
  try {
    const body = await c.req.json();
    const { subject_id, name, description, display_order } = body;
    
    const result = await c.env.DB.prepare(
      "INSERT INTO modules (subject_id, name, description, display_order) VALUES (?, ?, ?, ?)"
    ).bind(subject_id, name, description, display_order || 0).run();
    
    return c.json({ id: result.meta.last_row_id, success: true }, 201);
  } catch (error) {
    console.error("Create module error:", error);
    return c.json({ error: "Failed to create module" }, 500);
  }
});

// PATCH /api/modules/:id - Update module
app.patch("/api/modules/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const updates = [];
    const params = [];
    
    if (body.name !== undefined) { updates.push("name = ?"); params.push(body.name); }
    if (body.description !== undefined) { updates.push("description = ?"); params.push(body.description); }
    if (body.display_order !== undefined) { updates.push("display_order = ?"); params.push(body.display_order); }
    if (body.is_active !== undefined) { updates.push("is_active = ?"); params.push(body.is_active); }
    
    if (updates.length === 0) {
      return c.json({ error: "No fields to update" }, 400);
    }
    
    updates.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id);
    
    const query = `UPDATE modules SET ${updates.join(", ")} WHERE id = ?`;
    await c.env.DB.prepare(query).bind(...params).run();
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Update module error:", error);
    return c.json({ error: "Failed to update module" }, 500);
  }
});

// DELETE /api/modules/:id - Soft delete module
app.delete("/api/modules/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await c.env.DB.prepare("UPDATE modules SET is_active = 0 WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete module error:", error);
    return c.json({ error: "Failed to delete module" }, 500);
  }
});

// POST /api/topics - Create topic
app.post("/api/topics", async (c) => {
  try {
    const body = await c.req.json();
    const { module_id, name, description, display_order } = body;
    
    const result = await c.env.DB.prepare(
      "INSERT INTO topics (module_id, name, description, display_order) VALUES (?, ?, ?, ?)"
    ).bind(module_id, name, description, display_order || 0).run();
    
    return c.json({ id: result.meta.last_row_id, success: true }, 201);
  } catch (error) {
    console.error("Create topic error:", error);
    return c.json({ error: "Failed to create topic" }, 500);
  }
});



// PATCH /api/topics/:id - Update topic
app.patch("/api/topics/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const updates = [];
    const params = [];
    
    if (body.name !== undefined) { updates.push("name = ?"); params.push(body.name); }
    if (body.description !== undefined) { updates.push("description = ?"); params.push(body.description); }
    if (body.display_order !== undefined) { updates.push("display_order = ?"); params.push(body.display_order); }
    if (body.is_active !== undefined) { updates.push("is_active = ?"); params.push(body.is_active); }
    
    if (updates.length === 0) {
      return c.json({ error: "No fields to update" }, 400);
    }
    
    updates.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id);
    
    const query = `UPDATE topics SET ${updates.join(", ")} WHERE id = ?`;
    await c.env.DB.prepare(query).bind(...params).run();
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Update topic error:", error);
    return c.json({ error: "Failed to update topic" }, 500);
  }
});

// POST /api/skills - Create skill
app.post("/api/skills", async (c) => {
  try {
    const body = await c.req.json();
    const { topic_id, name, description, difficulty_level, mastery_threshold, display_order } = body;
    
    const result = await c.env.DB.prepare(
      "INSERT INTO skills (topic_id, name, description, difficulty_level, mastery_threshold, display_order) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(topic_id, name, description, difficulty_level || 1, mastery_threshold || 80, display_order || 0).run();
    
    return c.json({ id: result.meta.last_row_id, success: true }, 201);
  } catch (error) {
    console.error("Create skill error:", error);
    return c.json({ error: "Failed to create skill" }, 500);
  }
});

// PATCH /api/skills/:id - Update skill
app.patch("/api/skills/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const updates = [];
    const params = [];
    
    if (body.name !== undefined) { updates.push("name = ?"); params.push(body.name); }
    if (body.description !== undefined) { updates.push("description = ?"); params.push(body.description); }
    if (body.difficulty_level !== undefined) { updates.push("difficulty_level = ?"); params.push(body.difficulty_level); }
    if (body.mastery_threshold !== undefined) { updates.push("mastery_threshold = ?"); params.push(body.mastery_threshold); }
    if (body.display_order !== undefined) { updates.push("display_order = ?"); params.push(body.display_order); }
    if (body.is_active !== undefined) { updates.push("is_active = ?"); params.push(body.is_active); }
    
    if (updates.length === 0) {
      return c.json({ error: "No fields to update" }, 400);
    }
    
    updates.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id);
    
    const query = `UPDATE skills SET ${updates.join(", ")} WHERE id = ?`;
    await c.env.DB.prepare(query).bind(...params).run();
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Update skill error:", error);
    return c.json({ error: "Failed to update skill" }, 500);
  }
});

// POST /api/questions - Create question
app.post("/api/questions", async (c) => {
  try {
    const body = await c.req.json();
    console.log("Creating question with data:", body);
    
    const result = await c.env.DB.prepare(
      `INSERT INTO questions 
       (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      body.skill_id, 
      body.question_type || 'multiple_choice',
      body.question_text, 
      typeof body.question_data === 'string' ? body.question_data : JSON.stringify(body.question_data),
      body.correct_answer, 
      body.explanation || '',
      body.difficulty_rating || 1, 
      body.points_value || 10
    ).run();
    
    console.log("Question created with ID:", result.meta.last_row_id);
    return c.json({ id: result.meta.last_row_id, success: true }, 201);
  } catch (error) {
    console.error("Create question error:", error);
    return c.json({ error: "Failed to create question" }, 500);
  }
});

// PATCH /api/questions/:id - Update question
app.patch("/api/questions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const updates = [];
    const params = [];
    
    if (body.question_text !== undefined) { updates.push("question_text = ?"); params.push(body.question_text); }
    if (body.question_data !== undefined) { 
      updates.push("question_data = ?"); 
      params.push(typeof body.question_data === 'string' ? body.question_data : JSON.stringify(body.question_data)); 
    }
    if (body.correct_answer !== undefined) { updates.push("correct_answer = ?"); params.push(body.correct_answer); }
    if (body.explanation !== undefined) { updates.push("explanation = ?"); params.push(body.explanation); }
    if (body.difficulty_rating !== undefined) { updates.push("difficulty_rating = ?"); params.push(body.difficulty_rating); }
    if (body.points_value !== undefined) { updates.push("points_value = ?"); params.push(body.points_value); }
    if (body.is_active !== undefined) { updates.push("is_active = ?"); params.push(body.is_active); }
    
    if (updates.length === 0) {
      return c.json({ error: "No fields to update" }, 400);
    }
    
    updates.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id);
    
    const query = `UPDATE questions SET ${updates.join(", ")} WHERE id = ?`;
    await c.env.DB.prepare(query).bind(...params).run();
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Update question error:", error);
    return c.json({ error: "Failed to update question" }, 500);
  }
});

// GET /api/modules/:id/topics - Get topics for a module
app.get("/api/modules/:id/topics", async (c) => {
  try {
    const id = c.req.param("id");
    
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM topics WHERE module_id = ? AND is_active = 1 ORDER BY display_order, name"
    ).bind(id).all();

    return c.json(results || []);
  } catch (error) {
    console.error("Topics fetch error:", error);
    return c.json({ error: "Failed to fetch topics" }, 500);
  }
});

// GET /api/topics/:id/skills - Get skills for a topic
app.get("/api/topics/:id/skills", async (c) => {
  try {
    const id = c.req.param("id");
    
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM skills WHERE topic_id = ? AND is_active = 1 ORDER BY display_order, name"
    ).bind(id).all();

    return c.json(results || []);
  } catch (error) {
    console.error("Skills fetch error:", error);
    return c.json({ error: "Failed to fetch skills" }, 500);
  }
});

// GET /api/skills/:id/questions - Get questions for a skill (already exists, but ensure it returns all questions)
app.get("/api/skills/:id/questions", async (c) => {
  try {
    const id = c.req.param("id");
    
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM questions WHERE skill_id = ? AND is_active = 1 ORDER BY id"
    ).bind(id).all();

    return c.json(results || []);
  } catch (error) {
    console.error("Questions fetch error:", error);
    return c.json({ error: "Failed to fetch questions" }, 500);
  }
});

// Add these DELETE endpoints to your index.ts

// DELETE /api/modules/:id
app.delete("/api/modules/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await c.env.DB.prepare("UPDATE modules SET is_active = 0 WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to delete module" }, 500);
  }
});

// DELETE /api/topics/:id
app.delete("/api/topics/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await c.env.DB.prepare("UPDATE topics SET is_active = 0 WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to delete topic" }, 500);
  }
});

// DELETE /api/skills/:id
app.delete("/api/skills/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await c.env.DB.prepare("UPDATE skills SET is_active = 0 WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to delete skill" }, 500);
  }
});

// DELETE /api/questions/:id
app.delete("/api/questions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await c.env.DB.prepare("UPDATE questions SET is_active = 0 WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to delete question" }, 500);
  }
});

// ============================================================
// ANALYTICS ENDPOINTS (FIXED FOR ACTUAL SCHEMA)
// ============================================================

app.get("/api/analytics/overall-stats", async (c) => {
  try {
    const userId = "dev-user"; // Hardcoded for development

    // Get overall statistics - using only columns that exist
    const stats = await c.env.DB.prepare(`
      SELECT 
        COALESCE(AVG(sp.smart_score), 0) as average_smart_score,
        COALESCE(SUM(sp.questions_attempted), 0) as total_questions_answered,
        CASE 
          WHEN COALESCE(SUM(sp.questions_attempted), 0) > 0 
          THEN ROUND((SUM(sp.questions_correct) * 100.0 / SUM(sp.questions_attempted)), 1)
          ELSE 0 
        END as overall_accuracy,
        -- Estimate time spent based on questions (assuming 2 minutes per question)
        COALESCE(SUM(sp.questions_attempted) * 2, 0) / 60.0 as time_spent_hours
      FROM skill_progress sp
      WHERE sp.user_id = ?
    `).bind(userId).first();

    return c.json({
      average_smart_score: Math.round((stats as any)?.average_smart_score || 0),
      total_questions_answered: (stats as any)?.total_questions_answered || 0,
      overall_accuracy: (stats as any)?.overall_accuracy || 0,
      time_spent_hours: parseFloat(((stats as any)?.time_spent_hours || 0).toFixed(1))
    });

  } catch (error) {
    console.error("Overall stats error:", error);
    return c.json({ 
      error: "Failed to fetch overall stats",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

app.get("/api/analytics/top-skills", async (c) => {
  try {
    const userId = "dev-user"; // Hardcoded for development
    const limit = parseInt(c.req.query("limit") || "10");

    const { results } = await c.env.DB.prepare(`
      SELECT 
        sp.skill_id,
        s.name as skill_name,
        sub.name as subject_name,
        sp.smart_score,
        CASE 
          WHEN sp.questions_attempted > 0 
          THEN ROUND((sp.questions_correct * 100.0 / sp.questions_attempted), 1)
          ELSE 0 
        END as accuracy,
        sp.questions_attempted as questions_answered,
        sp.last_practiced_at
      FROM skill_progress sp
      JOIN skills s ON sp.skill_id = s.id
      JOIN topics t ON s.topic_id = t.id
      JOIN modules m ON t.module_id = m.id
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE sp.user_id = ? AND sp.questions_attempted > 0
      ORDER BY sp.smart_score DESC, sp.questions_attempted DESC
      LIMIT ?
    `).bind(userId, limit).all();

    return c.json(results || []);

  } catch (error) {
    console.error("Top skills error:", error);
    return c.json({ 
      error: "Failed to fetch top skills",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

app.get("/api/analytics/subject-performance", async (c) => {
  try {
    const userId = "dev-user"; // Hardcoded for development

    const { results } = await c.env.DB.prepare(`
      SELECT 
        sub.name as subject_name,
        ROUND(AVG(sp.smart_score), 0) as average_score,
        -- Estimate time based on questions attempted (2 minutes per question)
        SUM(sp.questions_attempted) * 2 as total_time_minutes,
        COUNT(DISTINCT sp.skill_id) as skills_practiced,
        SUM(sp.questions_attempted) as total_questions
      FROM skill_progress sp
      JOIN skills s ON sp.skill_id = s.id
      JOIN topics t ON s.topic_id = t.id
      JOIN modules m ON t.module_id = m.id
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE sp.user_id = ? AND sp.questions_attempted > 0
      GROUP BY sub.id, sub.name
      ORDER BY average_score DESC
    `).bind(userId).all();

    return c.json(results || []);

  } catch (error) {
    console.error("Subject performance error:", error);
    return c.json({ 
      error: "Failed to fetch subject performance",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

app.get("/api/analytics/weak-skills", async (c) => {
  try {
    const userId = "dev-user"; // Hardcoded for development
    const limit = parseInt(c.req.query("limit") || "10");

    const { results } = await c.env.DB.prepare(`
      SELECT 
        sp.skill_id,
        s.name as skill_name,
        sub.name as subject_name,
        sp.smart_score,
        CASE 
          WHEN sp.questions_attempted > 0 
          THEN ROUND((sp.questions_correct * 100.0 / sp.questions_attempted), 1)
          ELSE 0 
        END as accuracy,
        sp.questions_attempted as questions_answered,
        sp.last_practiced_at
      FROM skill_progress sp
      JOIN skills s ON sp.skill_id = s.id
      JOIN topics t ON s.topic_id = t.id
      JOIN modules m ON t.module_id = m.id
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE sp.user_id = ? AND sp.questions_attempted > 0
      ORDER BY sp.smart_score ASC, sp.last_practiced_at ASC
      LIMIT ?
    `).bind(userId, limit).all();

    return c.json(results || []);

  } catch (error) {
    console.error("Weak skills error:", error);
    return c.json({ 
      error: "Failed to fetch weak skills",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Add this to your index.ts to check the schema
app.get("/api/debug/skill-progress-schema", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "PRAGMA table_info(skill_progress)"
    ).all();
    
    return c.json({ columns: results });
  } catch (error) {
    return c.json({ error: "Failed to check schema" }, 500);
  }
});

// Add these diagnostic endpoints to help debug
app.get("/api/debug/user-progress", async (c) => {
  try {
    const userId = "dev-user";
    
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM skill_progress WHERE user_id = ? LIMIT 10"
    ).bind(userId).all();
    
    return c.json({ 
      user_id: userId,
      progress_records: results || [],
      total_records: results?.length || 0
    });
  } catch (error) {
    return c.json({ error: "Failed to fetch user progress" }, 500);
  }
});

app.get("/api/debug/all-tables", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table'"
    ).all();
    
    return c.json({ tables: results });
  } catch (error) {
    return c.json({ error: "Failed to fetch tables" }, 500);
  }
});

app.get("/api/debug/skill-progress-count", async (c) => {
  try {
    const stats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT skill_id) as unique_skills,
        SUM(questions_attempted) as total_questions_attempted
      FROM skill_progress
    `).first();
    
    return c.json(stats);
  } catch (error) {
    return c.json({ error: "Failed to fetch progress stats" }, 500);
  }
});

// ============================================================
// SAMPLE DATA GENERATION FOR DEVELOPMENT
// ============================================================

app.post("/api/dev/generate-sample-progress", async (c) => {
  try {
    const userId = "dev-user";
    
    // Get some skills to generate progress for
    const { results: skills } = await c.env.DB.prepare(
      "SELECT id FROM skills WHERE is_active = 1 LIMIT 20"
    ).bind().all();

    if (!skills || skills.length === 0) {
      return c.json({ error: "No skills found. Please inject content first." }, 400);
    }

    let generatedCount = 0;

    for (const skill of skills) {
      // Generate realistic progress data
      const smartScore = Math.floor(Math.random() * 40) + 60; // 60-100
      const questionsAttempted = Math.floor(Math.random() * 50) + 10; // 10-60
      const questionsCorrect = Math.floor(questionsAttempted * (smartScore / 100));
      const isMastered = smartScore >= 90 ? 1 : 0;

      // Insert or update progress
      await c.env.DB.prepare(`
        INSERT OR REPLACE INTO skill_progress 
        (user_id, skill_id, smart_score, questions_attempted, questions_correct, current_streak, is_mastered, last_practiced_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(userId, (skill as any).id, smartScore, questionsAttempted, questionsCorrect, Math.floor(Math.random() * 5), isMastered).run();

      generatedCount++;
    }

    return c.json({ 
      success: true, 
      message: `Generated progress data for ${generatedCount} skills`,
      user_id: userId
    });

  } catch (error) {
    console.error("Sample data generation error:", error);
    return c.json({ 
      error: "Failed to generate sample data",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ============================================================
// FIXED ANALYTICS ENDPOINTS WITH FALLBACK
// ============================================================

app.get("/api/analytics/overall-stats", async (c) => {
  try {
    const userId = "dev-user";

    const stats = await c.env.DB.prepare(`
      SELECT 
        COALESCE(AVG(sp.smart_score), 0) as average_smart_score,
        COALESCE(SUM(sp.questions_attempted), 0) as total_questions_answered,
        CASE 
          WHEN COALESCE(SUM(sp.questions_attempted), 0) > 0 
          THEN ROUND((SUM(sp.questions_correct) * 100.0 / SUM(sp.questions_attempted)), 1)
          ELSE 0 
        END as overall_accuracy,
        COALESCE(SUM(sp.time_spent_seconds), 0) / 3600.0 as time_spent_hours
      FROM skill_progress sp
      WHERE sp.user_id = ?
    `).bind(userId).first();

    const result = {
      average_smart_score: Math.round((stats as any)?.average_smart_score || 0),
      total_questions_answered: (stats as any)?.total_questions_answered || 0,
      overall_accuracy: (stats as any)?.overall_accuracy || 0,
      time_spent_hours: parseFloat(((stats as any)?.time_spent_hours || 0).toFixed(1))
    };

    // If no data, return zeros instead of error
    if (result.total_questions_answered === 0) {
      console.log("No progress data found for user:", userId);
    }

    return c.json(result);

  } catch (error) {
    console.error("Overall stats error:", error);
    // Return default values instead of error
    return c.json({
      average_smart_score: 0,
      total_questions_answered: 0,
      overall_accuracy: 0,
      time_spent_hours: 0
    });
  }
});

app.get("/api/analytics/top-skills", async (c) => {
  try {
    const userId = "dev-user";
    const limit = parseInt(c.req.query("limit") || "10");

    const { results } = await c.env.DB.prepare(`
      SELECT 
        sp.skill_id,
        s.name as skill_name,
        sub.name as subject_name,
        sp.smart_score,
        CASE 
          WHEN sp.questions_attempted > 0 
          THEN ROUND((sp.questions_correct * 100.0 / sp.questions_attempted), 1)
          ELSE 0 
        END as accuracy,
        sp.questions_attempted as questions_answered,
        sp.last_practiced_at
      FROM skill_progress sp
      JOIN skills s ON sp.skill_id = s.id
      JOIN topics t ON s.topic_id = t.id
      JOIN modules m ON t.module_id = m.id
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE sp.user_id = ? AND sp.questions_attempted > 0
      ORDER BY sp.smart_score DESC, sp.questions_attempted DESC
      LIMIT ?
    `).bind(userId, limit).all();

    return c.json(results || []);

  } catch (error) {
    console.error("Top skills error:", error);
    return c.json([]); // Return empty array instead of error
  }
});

app.get("/api/analytics/subject-performance", async (c) => {
  try {
    const userId = "dev-user";

    const { results } = await c.env.DB.prepare(`
      SELECT 
        sub.name as subject_name,
        ROUND(AVG(sp.smart_score), 0) as average_score,
        SUM(COALESCE(sp.time_spent_seconds, 0)) / 60 as total_time_minutes,
        COUNT(DISTINCT sp.skill_id) as skills_practiced,
        SUM(sp.questions_attempted) as total_questions
      FROM skill_progress sp
      JOIN skills s ON sp.skill_id = s.id
      JOIN topics t ON s.topic_id = t.id
      JOIN modules m ON t.module_id = m.id
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE sp.user_id = ? AND sp.questions_attempted > 0
      GROUP BY sub.id, sub.name
      ORDER BY average_score DESC
    `).bind(userId).all();

    return c.json(results || []);

  } catch (error) {
    console.error("Subject performance error:", error);
    return c.json([]); // Return empty array instead of error
  }
});

app.get("/api/analytics/weak-skills", async (c) => {
  try {
    const userId = "dev-user";
    const limit = parseInt(c.req.query("limit") || "10");

    const { results } = await c.env.DB.prepare(`
      SELECT 
        sp.skill_id,
        s.name as skill_name,
        sub.name as subject_name,
        sp.smart_score,
        CASE 
          WHEN sp.questions_attempted > 0 
          THEN ROUND((sp.questions_correct * 100.0 / sp.questions_attempted), 1)
          ELSE 0 
        END as accuracy,
        sp.questions_attempted as questions_answered,
        sp.last_practiced_at
      FROM skill_progress sp
      JOIN skills s ON sp.skill_id = s.id
      JOIN topics t ON s.topic_id = t.id
      JOIN modules m ON t.module_id = m.id
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE sp.user_id = ? AND sp.questions_attempted > 0
      ORDER BY sp.smart_score ASC, sp.last_practiced_at ASC
      LIMIT ?
    `).bind(userId, limit).all();

    return c.json(results || []);

  } catch (error) {
    console.error("Weak skills error:", error);
    return c.json([]); // Return empty array instead of error
  }
});

// Add these to check your current data state
app.get("/api/debug/check-data", async (c) => {
  try {
    // Check subjects count
    const subjectsCount = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM subjects WHERE is_active = 1"
    ).first();

    // Check skills count  
    const skillsCount = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM skills WHERE is_active = 1"
    ).first();

    // Check progress count
    const progressCount = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM skill_progress WHERE user_id = 'dev-user'"
    ).first();

    return c.json({
      subjects: (subjectsCount as any)?.count || 0,
      skills: (skillsCount as any)?.count || 0,
      progress_records: (progressCount as any)?.count || 0
    });

  } catch (error) {
    return c.json({ error: "Diagnostic failed" }, 500);
  }
});

// ============================================================
// PROGRESS TRACKING ENDPOINTS
// ============================================================

app.post("/api/skills/:id/progress", async (c) => {
  try {
    const skillId = c.req.param("id");
    const userId = "dev-user"; // Hardcoded for development
    const body = await c.req.json();
    
    const { 
      smart_score, 
      questions_attempted, 
      questions_correct, 
      current_streak, 
      is_mastered,
      time_spent_seconds = 0 
    } = body;

    // Calculate mastery based on smart_score if not provided
    const calculated_mastered = is_mastered !== undefined ? is_mastered : (smart_score >= 90);
    const mastered_at = calculated_mastered ? new Date().toISOString() : null;

    // Get current best streak to compare
    const currentProgress = await c.env.DB.prepare(
      "SELECT best_streak FROM skill_progress WHERE user_id = ? AND skill_id = ?"
    ).bind(userId, skillId).first();

    const currentBestStreak = (currentProgress as any)?.best_streak || 0;
    const newBestStreak = Math.max(currentBestStreak, current_streak);

    // Insert or update progress
    const result = await c.env.DB.prepare(`
      INSERT OR REPLACE INTO skill_progress 
      (user_id, skill_id, smart_score, questions_attempted, questions_correct, 
       current_streak, best_streak, is_mastered, mastered_at, last_practiced_at, time_spent_seconds)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
    `).bind(
      userId, 
      skillId, 
      smart_score, 
      questions_attempted, 
      questions_correct,
      current_streak,
      newBestStreak,
      calculated_mastered,
      mastered_at,
      time_spent_seconds
    ).run();

    return c.json({ 
      success: true, 
      message: "Progress updated successfully",
      progress_id: result.meta.last_row_id 
    });

  } catch (error) {
    console.error("Progress update error:", error);
    return c.json({ 
      error: "Failed to update progress",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

app.post("/api/practice-sessions", async (c) => {
  try {
    const userId = "dev-user";
    const body = await c.req.json();
    
    const { 
      skill_id, 
      questions_attempted, 
      questions_correct, 
      final_score,
      time_spent_seconds = 0 
    } = body;

    const result = await c.env.DB.prepare(`
      INSERT INTO practice_sessions 
      (user_id, skill_id, questions_attempted, questions_correct, final_score, time_spent_seconds, start_time, end_time, is_completed)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
    `).bind(
      userId, 
      skill_id, 
      questions_attempted, 
      questions_correct,
      final_score,
      time_spent_seconds
    ).run();

    return c.json({ 
      success: true, 
      session_id: result.meta.last_row_id 
    });

  } catch (error) {
    console.error("Practice session error:", error);
    return c.json({ 
      error: "Failed to save practice session",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

app.post("/api/question-attempts", async (c) => {
  try {
    const userId = "dev-user";
    const body = await c.req.json();
    
    const { 
      session_id, 
      question_id, 
      user_answer, 
      is_correct,
      time_spent_seconds = 0 
    } = body;

    const result = await c.env.DB.prepare(`
      INSERT INTO question_attempts 
      (session_id, question_id, user_id, user_answer, is_correct, time_spent_seconds)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      session_id, 
      question_id, 
      userId, 
      user_answer, 
      is_correct ? 1 : 0,
      time_spent_seconds
    ).run();

    return c.json({ 
      success: true, 
      attempt_id: result.meta.last_row_id 
    });

  } catch (error) {
    console.error("Question attempt error:", error);
    return c.json({ 
      error: "Failed to save question attempt",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ============================================================
// IXL-STYLE PROGRESSIVE DIFFICULTY ENDPOINTS
// ============================================================

app.get("/api/skills/:id/adaptive-questions", async (c) => {
  try {
    const skillId = c.req.param("id");
    const userId = "dev-user";
    
    // Get current progress to determine difficulty level
    const progress = await c.env.DB.prepare(
      "SELECT smart_score, current_streak FROM skill_progress WHERE user_id = ? AND skill_id = ?"
    ).bind(userId, skillId).first();

    const currentSmartScore = (progress as any)?.smart_score || 0;
    const currentStreak = (progress as any)?.current_streak || 0;

    // Determine difficulty level based on smart score
    let targetDifficulty = 1;
    if (currentSmartScore >= 90) targetDifficulty = 5;
    else if (currentSmartScore >= 80) targetDifficulty = 4;
    else if (currentSmartScore >= 70) targetDifficulty = 3;
    else if (currentSmartScore >= 60) targetDifficulty = 2;

    // Get questions - mix of current level and some from previous levels for review
    const { results: questions } = await c.env.DB.prepare(`
      SELECT * FROM questions 
      WHERE skill_id = ? AND is_active = 1 
      AND difficulty_rating IN (?, ?, ?)
      ORDER BY 
        CASE 
          WHEN difficulty_rating = ? THEN 1  -- Current target level first
          WHEN difficulty_rating = ? THEN 2  -- One level easier
          WHEN difficulty_rating = ? THEN 3  -- One level harder (if available)
          ELSE 4
        END,
        RANDOM()
      LIMIT 20
    `).bind(
      skillId, 
      targetDifficulty, 
      Math.max(1, targetDifficulty - 1), 
      Math.min(5, targetDifficulty + 1),
      targetDifficulty,
      Math.max(1, targetDifficulty - 1),
      Math.min(5, targetDifficulty + 1)
    ).all();

    return c.json({
      questions: questions || [],
      current_difficulty: targetDifficulty,
      current_smart_score: currentSmartScore,
      next_difficulty_threshold: targetDifficulty < 5 ? 
        [60, 70, 80, 90, 100][targetDifficulty] : 100
    });

  } catch (error) {
    console.error("Adaptive questions error:", error);
    return c.json({ 
      error: "Failed to fetch adaptive questions",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

app.get("/api/skills/:id/next-question", async (c) => {
  try {
    const skillId = c.req.param("id");
    const userId = "dev-user";
    const { lastCorrect, currentStreak, currentSmartScore } = c.req.query();

    const wasLastCorrect = lastCorrect === 'true';
    const streak = parseInt(currentStreak || '0');
    const smartScore = parseInt(currentSmartScore || '0');

    // Calculate new difficulty based on performance
    let targetDifficulty = 1;
    if (smartScore >= 90) targetDifficulty = 5;
    else if (smartScore >= 80) targetDifficulty = 4;
    else if (smartScore >= 70) targetDifficulty = 3;
    else if (smartScore >= 60) targetDifficulty = 2;

    // If user got question wrong, go back one difficulty level (but not below 1)
    if (!wasLastCorrect && streak === 0) {
      targetDifficulty = Math.max(1, targetDifficulty - 1);
    }

    // Get next question at appropriate difficulty
    const question = await c.env.DB.prepare(`
      SELECT * FROM questions 
      WHERE skill_id = ? AND is_active = 1 AND difficulty_rating = ?
      ORDER BY RANDOM()
      LIMIT 1
    `).bind(skillId, targetDifficulty).first();

    if (!question) {
      // Fallback to any question if no questions at target difficulty
      const fallback = await c.env.DB.prepare(`
        SELECT * FROM questions 
        WHERE skill_id = ? AND is_active = 1
        ORDER BY RANDOM()
        LIMIT 1
      `).bind(skillId).first();
      
      return c.json({
        question: fallback,
        difficulty_level: targetDifficulty,
        message: fallback ? "Using fallback question" : "No questions available"
      });
    }

    return c.json({
      question: question,
      difficulty_level: targetDifficulty,
      message: "Next question retrieved"
    });

  } catch (error) {
    console.error("Next question error:", error);
    return c.json({ 
      error: "Failed to get next question",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

app.get("/api/skills/:id/mastery-status", async (c) => {
  try {
    const skillId = c.req.param("id");
    const userId = "dev-user";

    // Check if user has answered highest difficulty questions correctly
    const masteryCheck = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_questions,
        SUM(CASE WHEN q.difficulty_rating = 5 THEN 1 ELSE 0 END) as max_difficulty_questions,
        COUNT(DISTINCT qa.question_id) as answered_questions,
        SUM(CASE WHEN qa.is_correct = 1 AND q.difficulty_rating = 5 THEN 1 ELSE 0 END) as correct_max_difficulty
      FROM questions q
      LEFT JOIN question_attempts qa ON q.id = qa.question_id AND qa.user_id = ?
      WHERE q.skill_id = ? AND q.is_active = 1
    `).bind(userId, skillId).first();

    const stats = masteryCheck as any;
    const hasMastered = stats.correct_max_difficulty >= 3; // Need 3 correct at max difficulty

    return c.json({
      mastered: hasMastered,
      stats: {
        total_questions: stats.total_questions,
        max_difficulty_questions: stats.max_difficulty_questions,
        correct_max_difficulty: stats.correct_max_difficulty,
        required_for_mastery: 3
      }
    });

  } catch (error) {
    console.error("Mastery status error:", error);
    return c.json({ 
      error: "Failed to check mastery status",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ============================================================
// COMPREHENSIVE ANALYTICS ENDPOINTS
// ============================================================

app.get("/api/analytics/summary", async (c) => {
  try {
    const userId = "dev-user";

    // Get comprehensive summary stats
    const summary = await c.env.DB.prepare(`
      SELECT 
        COALESCE(SUM(sp.questions_attempted), 0) as total_questions_answered,
        COALESCE(SUM(sp.time_spent_seconds), 0) as total_time_seconds,
        COUNT(DISTINCT sp.skill_id) as skills_practiced,
        SUM(CASE WHEN sp.is_mastered = 1 THEN 1 ELSE 0 END) as skills_mastered,
        SUM(CASE WHEN sp.smart_score >= 80 AND sp.is_mastered = 0 THEN 1 ELSE 0 END) as skills_proficient
      FROM skill_progress sp
      WHERE sp.user_id = ? AND sp.questions_attempted > 0
    `).bind(userId).first();

    const stats = summary as any;
    const totalHours = Math.floor(stats.total_time_seconds / 3600);
    const totalMinutes = Math.floor((stats.total_time_seconds % 3600) / 60);

    return c.json({
      total_questions: stats.total_questions_answered,
      total_time: {
        hours: totalHours,
        minutes: totalMinutes,
        display: `${totalHours} hr ${totalMinutes} min`
      },
      skills_practiced: stats.skills_practiced,
      skills_mastered: stats.skills_mastered,
      skills_proficient: stats.skills_proficient
    });

  } catch (error) {
    console.error("Analytics summary error:", error);
    return c.json({ 
      error: "Failed to fetch analytics summary",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

app.get("/api/analytics/subject-breakdown", async (c) => {
  try {
    const userId = "dev-user";

    const { results } = await c.env.DB.prepare(`
      SELECT 
        sub.name as subject_name,
        COUNT(DISTINCT sp.skill_id) as skills_practiced,
        SUM(CASE WHEN sp.is_mastered = 1 THEN 1 ELSE 0 END) as skills_mastered,
        SUM(CASE WHEN sp.smart_score >= 80 AND sp.is_mastered = 0 THEN 1 ELSE 0 END) as skills_proficient,
        AVG(sp.smart_score) as average_score,
        SUM(sp.questions_attempted) as questions_attempted,
        SUM(sp.time_spent_seconds) as time_spent_seconds
      FROM skill_progress sp
      JOIN skills s ON sp.skill_id = s.id
      JOIN topics t ON s.topic_id = t.id
      JOIN modules m ON t.module_id = m.id
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE sp.user_id = ? AND sp.questions_attempted > 0
      GROUP BY sub.id, sub.name
      ORDER BY questions_attempted DESC
    `).bind(userId).all();

    return c.json(results || []);

  } catch (error) {
    console.error("Subject breakdown error:", error);
    return c.json({ 
      error: "Failed to fetch subject breakdown",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

app.get("/api/analytics/recent-skills", async (c) => {
  try {
    const userId = "dev-user";
    const limit = parseInt(c.req.query("limit") || "10");

    const { results } = await c.env.DB.prepare(`
      SELECT 
        s.name as skill_name,
        sub.name as subject_name,
        sp.smart_score,
        sp.is_mastered,
        sp.last_practiced_at,
        sp.questions_attempted,
        sp.questions_correct
      FROM skill_progress sp
      JOIN skills s ON sp.skill_id = s.id
      JOIN topics t ON s.topic_id = t.id
      JOIN modules m ON t.module_id = m.id
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE sp.user_id = ? AND sp.questions_attempted > 0
      ORDER BY sp.last_practiced_at DESC
      LIMIT ?
    `).bind(userId, limit).all();

    return c.json(results || []);

  } catch (error) {
    console.error("Recent skills error:", error);
    return c.json({ 
      error: "Failed to fetch recent skills",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

app.get("/api/analytics/weak-skills-detailed", async (c) => {
  try {
    const userId = "dev-user";
    const limit = parseInt(c.req.query("limit") || "10");

    const { results } = await c.env.DB.prepare(`
      SELECT 
        s.name as skill_name,
        sub.name as subject_name,
        sp.smart_score,
        sp.questions_attempted,
        sp.questions_correct,
        (sp.questions_attempted - sp.questions_correct) as questions_missed,
        sp.last_practiced_at
      FROM skill_progress sp
      JOIN skills s ON sp.skill_id = s.id
      JOIN topics t ON s.topic_id = t.id
      JOIN modules m ON t.module_id = m.id
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE sp.user_id = ? 
        AND sp.questions_attempted > 0 
        AND sp.smart_score < 70
        AND sp.is_mastered = 0
      ORDER BY questions_missed DESC, sp.smart_score ASC
      LIMIT ?
    `).bind(userId, limit).all();

    return c.json(results || []);

  } catch (error) {
    console.error("Weak skills detailed error:", error);
    return c.json({ 
      error: "Failed to fetch weak skills",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

app.get("/api/analytics/daily-time", async (c) => {
  try {
    const userId = "dev-user";
    const days = parseInt(c.req.query("days") || "30");

    const { results } = await c.env.DB.prepare(`
      SELECT 
        DATE(ps.start_time) as practice_date,
        SUM(ps.time_spent_seconds) as total_seconds,
        COUNT(DISTINCT ps.skill_id) as skills_practiced,
        SUM(ps.questions_attempted) as questions_attempted
      FROM practice_sessions ps
      WHERE ps.user_id = ? 
        AND ps.start_time >= date('now', '-' || ? || ' days')
      GROUP BY DATE(ps.start_time)
      ORDER BY practice_date ASC
    `).bind(userId, days).all();

    return c.json(results || []);

  } catch (error) {
    console.error("Daily time error:", error);
    return c.json({ 
      error: "Failed to fetch daily time data",
      details: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ============================================================
// USAGE ANALYTICS ENDPOINTS
// ============================================================

app.get("/api/analytics/usage/summary", async (c) => {
  try {
    const userId = "dev-user";
    const { startDate, endDate } = c.req.query();

    let dateFilter = "";
    const params: any[] = [userId];

    if (startDate && endDate) {
      dateFilter = "AND DATE(sp.last_practiced_at) BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const summary = await c.env.DB.prepare(`
      SELECT 
        COALESCE(SUM(sp.questions_attempted), 0) as total_questions,
        COALESCE(SUM(sp.questions_attempted) * 120, 0) as total_time_seconds,
        COUNT(DISTINCT sp.skill_id) as skills_practiced,
        COUNT(DISTINCT CASE WHEN sp.questions_attempted > 0 THEN sp.skill_id END) as skills_with_progress
      FROM skill_progress sp
      WHERE sp.user_id = ? ${dateFilter}
    `).bind(...params).first();

    const stats = summary as any;
    const totalHours = Math.floor(stats.total_time_seconds / 3600);
    const totalMinutes = Math.floor((stats.total_time_seconds % 3600) / 60);

    return c.json({
      total_questions: stats.total_questions,
      total_time: {
        hours: totalHours,
        minutes: totalMinutes,
        display: `${totalHours} hr ${totalMinutes} min`
      },
      skills_practiced: stats.skills_practiced,
      skills_with_progress: stats.skills_with_progress
    });

  } catch (error) {
    console.error("Usage summary error:", error);
    return c.json({ 
      total_questions: 0,
      total_time: { hours: 0, minutes: 0, display: "0 hr 0 min" },
      skills_practiced: 0,
      skills_with_progress: 0
    });
  }
});

app.get("/api/analytics/usage/category-breakdown", async (c) => {
  try {
    const userId = "dev-user";
    const { startDate, endDate } = c.req.query();

    let dateFilter = "";
    const params: any[] = [userId];

    if (startDate && endDate) {
      dateFilter = "AND DATE(sp.last_practiced_at) BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const { results } = await c.env.DB.prepare(`
      SELECT 
        t.name as category_name,
        COUNT(DISTINCT sp.skill_id) as skills_count,
        SUM(sp.questions_attempted) as questions_attempted,
        SUM(sp.questions_attempted) * 120 as time_spent_seconds,
        ROUND((SUM(sp.questions_attempted) * 100.0 / (
          SELECT SUM(questions_attempted) 
          FROM skill_progress 
          WHERE user_id = ? ${dateFilter.replace('sp.', '')}
        )), 1) as percentage
      FROM skill_progress sp
      JOIN skills s ON sp.skill_id = s.id
      JOIN topics t ON s.topic_id = t.id
      WHERE sp.user_id = ? ${dateFilter}
      GROUP BY t.id, t.name
      HAVING questions_attempted > 0
      ORDER BY questions_attempted DESC
      LIMIT 10
    `).bind(userId, ...params.slice(1), ...params).all();

    return c.json(results || []);

  } catch (error) {
    console.error("Category breakdown error:", error);
    return c.json([]);
  }
});

app.get("/api/analytics/usage/monthly-breakdown", async (c) => {
  try {
    const userId = "dev-user";
    const { startDate, endDate } = c.req.query();

    let dateFilter = "";
    const params: any[] = [userId];

    if (startDate && endDate) {
      dateFilter = "AND DATE(ps.start_time) BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const { results } = await c.env.DB.prepare(`
      SELECT 
        strftime('%Y-%m', ps.start_time) as month,
        SUM(ps.questions_attempted) as questions_answered,
        COUNT(DISTINCT ps.skill_id) as skills_practiced,
        SUM(COALESCE(ps.time_spent_seconds, ps.questions_attempted * 120)) as total_time_seconds
      FROM practice_sessions ps
      WHERE ps.user_id = ? ${dateFilter}
      GROUP BY strftime('%Y-%m', ps.start_time)
      ORDER BY month DESC
      LIMIT 12
    `).bind(...params).all();

    // If no practice_sessions data, generate from skill_progress
    if (!results || results.length === 0) {
      let fallbackFilter = "";
      const fallbackParams: any[] = [userId];
      
      if (startDate && endDate) {
        fallbackFilter = "AND DATE(sp.last_practiced_at) BETWEEN ? AND ?";
        fallbackParams.push(startDate, endDate);
      }

      const fallback = await c.env.DB.prepare(`
        SELECT 
          strftime('%Y-%m', sp.last_practiced_at) as month,
          SUM(sp.questions_attempted) as questions_answered,
          COUNT(DISTINCT sp.skill_id) as skills_practiced,
          SUM(sp.questions_attempted) * 120 as total_time_seconds
        FROM skill_progress sp
        WHERE sp.user_id = ? AND sp.last_practiced_at IS NOT NULL ${fallbackFilter}
        GROUP BY strftime('%Y-%m', sp.last_practiced_at)
        ORDER BY month DESC
        LIMIT 12
      `).bind(...fallbackParams).all();

      return c.json(fallback.results || []);
    }

    return c.json(results || []);

  } catch (error) {
    console.error("Monthly breakdown error:", error);
    return c.json([]);
  }
});

app.get("/api/analytics/usage/practice-sessions", async (c) => {
  try {
    const userId = "dev-user";
    const { startDate, endDate, limit = "20" } = c.req.query();

    let dateFilter = "";
    const params: any[] = [userId];

    if (startDate && endDate) {
      dateFilter = "AND DATE(ps.start_time) BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    params.push(parseInt(limit));

    const { results } = await c.env.DB.prepare(`
      SELECT 
        ps.id,
        ps.start_time,
        ps.end_time,
        ps.questions_attempted,
        ps.questions_correct,
        ps.skill_id,
        s.name as skill_name,
        sub.name as subject_name,
        COALESCE(ps.time_spent_seconds, ps.questions_attempted * 120) as time_spent_seconds,
        ROUND((ps.questions_correct * 100.0 / NULLIF(ps.questions_attempted, 0)), 0) as accuracy
      FROM practice_sessions ps
      JOIN skills s ON ps.skill_id = s.id
      JOIN topics t ON s.topic_id = t.id
      JOIN modules m ON t.module_id = m.id
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE ps.user_id = ? ${dateFilter}
      ORDER BY ps.start_time DESC
      LIMIT ?
    `).bind(...params).all();

    return c.json(results || []);

  } catch (error) {
    console.error("Practice sessions error:", error);
    return c.json([]);
  }
});

app.get("/api/analytics/usage/session-questions", async (c) => {
  try {
    const sessionId = c.req.query("sessionId");
    
    if (!sessionId) {
      return c.json([]);
    }

    const { results } = await c.env.DB.prepare(`
      SELECT 
        qa.id,
        qa.question_id,
        q.question_text,
        qa.user_answer,
        q.correct_answer,
        qa.is_correct,
        qa.time_spent_seconds,
        qa.attempted_at
      FROM question_attempts qa
      JOIN questions q ON qa.question_id = q.id
      WHERE qa.session_id = ?
      ORDER BY qa.attempted_at ASC
    `).bind(sessionId).all();

    return c.json(results || []);

  } catch (error) {
    console.error("Session questions error:", error);
    return c.json([]);
  }
});



export default app;