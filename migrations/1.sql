
-- Core user profile extension
CREATE TABLE user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student',
  institution_id INTEGER,
  grade_level TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_institution_id ON user_profiles(institution_id);

-- Institutions (schools, colleges, training centers)
CREATE TABLE institutions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  institution_type TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects (e.g., Mathematics N4, Engineering Science N5)
CREATE TABLE subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  nated_level TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  color_hex TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_subjects_nated_level ON subjects(nated_level);

-- Modules (chapters within a subject)
CREATE TABLE modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_modules_subject_id ON modules(subject_id);

-- Topics (sections within a module)
CREATE TABLE topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_topics_module_id ON topics(module_id);

-- Skills (individual practice skills - the core learning unit)
CREATE TABLE skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  difficulty_level INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  mastery_threshold INTEGER DEFAULT 90,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_skills_topic_id ON skills(topic_id);

-- Questions (question bank)
CREATE TABLE questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id INTEGER NOT NULL,
  question_type TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_data TEXT,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty_rating INTEGER DEFAULT 1,
  blooms_level TEXT,
  points_value INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_skill_id ON questions(skill_id);
CREATE INDEX idx_questions_difficulty_rating ON questions(difficulty_rating);

-- Student skill progress (tracks mastery per skill)
CREATE TABLE skill_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  skill_id INTEGER NOT NULL,
  smart_score INTEGER DEFAULT 0,
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  is_mastered BOOLEAN DEFAULT 0,
  mastered_at TIMESTAMP,
  last_practiced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, skill_id)
);

CREATE INDEX idx_skill_progress_user_id ON skill_progress(user_id);
CREATE INDEX idx_skill_progress_skill_id ON skill_progress(skill_id);
CREATE INDEX idx_skill_progress_smart_score ON skill_progress(smart_score);

-- Practice sessions
CREATE TABLE practice_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  skill_id INTEGER NOT NULL,
  session_type TEXT DEFAULT 'practice',
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  final_score INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_skill_id ON practice_sessions(skill_id);

-- Question attempts (tracks each question answered)
CREATE TABLE question_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  user_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_question_attempts_session_id ON question_attempts(session_id);
CREATE INDEX idx_question_attempts_user_id ON question_attempts(user_id);
CREATE INDEX idx_question_attempts_question_id ON question_attempts(question_id);

-- Achievements and badges
CREATE TABLE achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  badge_icon_url TEXT,
  achievement_type TEXT NOT NULL,
  criteria_json TEXT,
  points_value INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements
CREATE TABLE user_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  achievement_id INTEGER NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- Classes (for teacher grouping of students)
CREATE TABLE classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id TEXT NOT NULL,
  institution_id INTEGER,
  name TEXT NOT NULL,
  subject_id INTEGER,
  class_code TEXT UNIQUE,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_classes_institution_id ON classes(institution_id);

-- Class enrollments
CREATE TABLE class_enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL,
  student_id TEXT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(class_id, student_id)
);

CREATE INDEX idx_class_enrollments_class_id ON class_enrollments(class_id);
CREATE INDEX idx_class_enrollments_student_id ON class_enrollments(student_id);

-- Skill assignments (teacher assigns skills to students)
CREATE TABLE skill_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teacher_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  skill_id INTEGER NOT NULL,
  due_date DATE,
  is_completed BOOLEAN DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_skill_assignments_teacher_id ON skill_assignments(teacher_id);
CREATE INDEX idx_skill_assignments_student_id ON skill_assignments(student_id);
CREATE INDEX idx_skill_assignments_skill_id ON skill_assignments(skill_id);
