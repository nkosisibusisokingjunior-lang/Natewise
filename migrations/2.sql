
CREATE TABLE daily_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  challenge_date DATE NOT NULL UNIQUE,
  skill_id INTEGER NOT NULL,
  target_questions INTEGER DEFAULT 5,
  target_accuracy INTEGER DEFAULT 80,
  xp_reward INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_daily_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  challenge_id INTEGER NOT NULL,
  questions_completed INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT 0,
  completed_at TIMESTAMP,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, challenge_id)
);

CREATE TABLE user_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_questions_answered INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  current_weekly_streak INTEGER DEFAULT 0,
  total_time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leaderboard_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  rank INTEGER,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, category, period_start)
);

CREATE INDEX idx_daily_challenges_date ON daily_challenges(challenge_date);
CREATE INDEX idx_user_daily_challenges_user ON user_daily_challenges(user_id);
CREATE INDEX idx_user_stats_user ON user_stats(user_id);
CREATE INDEX idx_leaderboard_category ON leaderboard_entries(category, period_start);
