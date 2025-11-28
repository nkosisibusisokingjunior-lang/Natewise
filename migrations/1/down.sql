
DROP INDEX IF EXISTS idx_skill_assignments_skill_id;
DROP INDEX IF EXISTS idx_skill_assignments_student_id;
DROP INDEX IF EXISTS idx_skill_assignments_teacher_id;
DROP TABLE IF EXISTS skill_assignments;

DROP INDEX IF EXISTS idx_class_enrollments_student_id;
DROP INDEX IF EXISTS idx_class_enrollments_class_id;
DROP TABLE IF EXISTS class_enrollments;

DROP INDEX IF EXISTS idx_classes_institution_id;
DROP INDEX IF EXISTS idx_classes_teacher_id;
DROP TABLE IF EXISTS classes;

DROP INDEX IF EXISTS idx_user_achievements_user_id;
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;

DROP INDEX IF EXISTS idx_question_attempts_question_id;
DROP INDEX IF EXISTS idx_question_attempts_user_id;
DROP INDEX IF EXISTS idx_question_attempts_session_id;
DROP TABLE IF EXISTS question_attempts;

DROP INDEX IF EXISTS idx_practice_sessions_skill_id;
DROP INDEX IF EXISTS idx_practice_sessions_user_id;
DROP TABLE IF EXISTS practice_sessions;

DROP INDEX IF EXISTS idx_skill_progress_smart_score;
DROP INDEX IF EXISTS idx_skill_progress_skill_id;
DROP INDEX IF EXISTS idx_skill_progress_user_id;
DROP TABLE IF EXISTS skill_progress;

DROP INDEX IF EXISTS idx_questions_difficulty_rating;
DROP INDEX IF EXISTS idx_questions_skill_id;
DROP TABLE IF EXISTS questions;

DROP INDEX IF EXISTS idx_skills_topic_id;
DROP TABLE IF EXISTS skills;

DROP INDEX IF EXISTS idx_topics_module_id;
DROP TABLE IF EXISTS topics;

DROP INDEX IF EXISTS idx_modules_subject_id;
DROP TABLE IF EXISTS modules;

DROP INDEX IF EXISTS idx_subjects_nated_level;
DROP INDEX IF EXISTS idx_subjects_code;
DROP TABLE IF EXISTS subjects;

DROP TABLE IF EXISTS institutions;

DROP INDEX IF EXISTS idx_user_profiles_institution_id;
DROP INDEX IF EXISTS idx_user_profiles_user_id;
DROP TABLE IF EXISTS user_profiles;
