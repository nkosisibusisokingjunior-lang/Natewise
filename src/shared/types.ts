import type { MochaUser } from "@getmocha/users-service/shared";

// Extended user type with profile
export interface ExtendedUser extends MochaUser {
  profile: UserProfile;
}

export interface UserProfile {
  id: number;
  user_id: string;
  role: "student" | "teacher" | "admin" | "institution_admin";
  institution_id: number | null;
  grade_level: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  nated_level: string;
  description: string | null;
  icon_url: string | null;
  color_hex: string | null;
  display_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: number;
  subject_id: number;
  name: string;
  description: string | null;
  display_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: number;
  module_id: number;
  name: string;
  description: string | null;
  display_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  skills?: Skill[];
}

export interface Skill {
  id: number;
  topic_id: number;
  name: string;
  description: string | null;
  difficulty_level: number;
  display_order: number;
  mastery_threshold: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface SkillProgress {
  id: number;
  user_id: string;
  skill_id: number;
  smart_score: number;
  questions_attempted: number;
  questions_correct: number;
  current_streak: number;
  best_streak: number;
  time_spent_seconds: number;
  is_mastered: number;
  mastered_at: string | null;
  last_practiced_at: string | null;
  created_at: string;
  updated_at: string;
}
