-- ============================================================
-- SEED DATA FOR NATEWISE MOCHA APPLICATION
-- ============================================================

-- Clear existing data (optional - for clean reset)
DELETE FROM user_daily_challenges;
DELETE FROM daily_challenges;
DELETE FROM question_attempts;
DELETE FROM practice_sessions;
DELETE FROM skill_progress;
DELETE FROM user_achievements;
DELETE FROM achievements;
DELETE FROM class_enrollments;
DELETE FROM classes;
DELETE FROM skill_assignments;
DELETE FROM questions;
DELETE FROM skills;
DELETE FROM topics;
DELETE FROM modules;
DELETE FROM subjects;
DELETE FROM institutions;
DELETE FROM user_profiles;
DELETE FROM user_stats;

-- ============================================================
-- INSTITUTIONS
-- ============================================================
INSERT INTO institutions (name, institution_type, contact_email, contact_phone, address) VALUES
('Tech College Johannesburg', 'college', 'admin@techcollege.jhb.za', '+27-11-555-1000', '123 Education Street, Johannesburg'),
('Engineering Training Center', 'training_center', 'info@engineeringtraining.za', '+27-11-555-2000', '456 Innovation Ave, Sandton');

-- ============================================================
-- USER PROFILES & STATS
-- ============================================================
INSERT INTO user_profiles (user_id, role, institution_id, grade_level) VALUES
('dev-user', 'student', 1, 'N4'),
('teacher-1', 'teacher', 1, NULL);

INSERT INTO user_stats (user_id, total_xp, level, total_questions_answered, total_correct_answers, longest_streak, current_weekly_streak) VALUES
('dev-user', 1250, 3, 85, 67, 7, 3);

-- ============================================================
-- SUBJECTS (Two Complete Subjects)
-- ============================================================

-- Subject 1: Mathematics N4
INSERT INTO subjects (name, code, nated_level, description, icon_url, color_hex, display_order) VALUES
('Mathematics N4', 'MATH-N4', 'N4', 'Engineering Mathematics for N4 level covering algebra, calculus, and trigonometry', '/icons/math.svg', '#3B82F6', 1),
('Engineering Science N4', 'ENG-SCI-N4', 'N4', 'Fundamental principles of engineering science including mechanics and thermodynamics', '/icons/science.svg', '#EF4444', 2);

-- ============================================================
-- MODULES for Mathematics N4
-- ============================================================
INSERT INTO modules (subject_id, name, description, display_order) VALUES
-- Math N4 Modules
(1, 'Algebra and Equations', 'Solving linear, quadratic and simultaneous equations', 1),
(1, 'Calculus and Differentiation', 'Introduction to differential calculus and applications', 2),
(1, 'Trigonometry', 'Trigonometric functions, identities and equations', 3),
(1, 'Complex Numbers', 'Operations with complex numbers and Argand diagrams', 4),

-- Engineering Science N4 Modules
(2, 'Mechanics', 'Forces, motion, and mechanical principles', 1),
(2, 'Thermodynamics', 'Heat, energy, and thermodynamic systems', 2),
(2, 'Materials Science', 'Properties and behavior of engineering materials', 3),
(2, 'Electrical Principles', 'Basic electrical circuits and principles', 4);

-- ============================================================
-- TOPICS for each Module
-- ============================================================

-- Algebra and Equations (Module 1)
INSERT INTO topics (module_id, name, description, display_order) VALUES
(1, 'Linear Equations', 'Solving equations of first degree', 1),
(1, 'Quadratic Equations', 'Solving equations of second degree', 2),
(1, 'Simultaneous Equations', 'Solving systems of equations', 3),

-- Calculus and Differentiation (Module 2)
(2, 'Limits and Continuity', 'Understanding limits and function continuity', 1),
(2, 'Basic Differentiation', 'Rules of differentiation', 2),
(2, 'Applications of Derivatives', 'Using derivatives in practical problems', 3),

-- Trigonometry (Module 3)
(3, 'Trigonometric Functions', 'Sine, cosine, tangent and their graphs', 1),
(3, 'Trigonometric Identities', 'Fundamental trigonometric identities', 2),
(3, 'Solving Trigonometric Equations', 'Finding solutions to trig equations', 3),

-- Complex Numbers (Module 4)
(4, 'Complex Number Operations', 'Addition, subtraction, multiplication', 1),
(4, 'Argand Diagrams', 'Graphical representation of complex numbers', 2),

-- Mechanics (Module 5)
(5, 'Forces and Equilibrium', 'Static forces and equilibrium conditions', 1),
(5, 'Kinematics', 'Motion without considering forces', 2),
(5, 'Dynamics', 'Motion considering forces', 3),

-- Thermodynamics (Module 6)
(6, 'Heat Transfer', 'Conduction, convection and radiation', 1),
(6, 'Laws of Thermodynamics', 'Fundamental thermodynamic principles', 2),

-- Materials Science (Module 7)
(7, 'Material Properties', 'Strength, elasticity, hardness', 1),
(7, 'Material Testing', 'Methods for testing material properties', 2),

-- Electrical Principles (Module 8)
(8, 'DC Circuits', 'Direct current circuit analysis', 1),
(8, 'AC Circuits', 'Alternating current principles', 2);

-- ============================================================
-- SKILLS for each Topic
-- ============================================================

-- Linear Equations Skills (Topic 1)
INSERT INTO skills (topic_id, name, description, difficulty_level, display_order, mastery_threshold) VALUES
(1, 'Solve Basic Linear Equations', 'Solve equations like 2x + 3 = 11', 1, 1, 85),
(1, 'Solve Equations with Fractions', 'Solve equations containing fractional coefficients', 2, 2, 80),
(1, 'Word Problems with Linear Equations', 'Form and solve equations from word problems', 3, 3, 75),

-- Quadratic Equations Skills (Topic 2)
(2, 'Solve by Factoring', 'Solve quadratic equations by factoring method', 2, 1, 85),
(2, 'Quadratic Formula', 'Use quadratic formula to solve equations', 2, 2, 80),
(2, 'Completing the Square', 'Solve by completing the square method', 3, 3, 75),

-- Limits and Continuity Skills (Topic 4)
(4, 'Evaluate Simple Limits', 'Find limits of basic functions', 1, 1, 85),
(4, 'Continuity Assessment', 'Determine if a function is continuous', 2, 2, 80),

-- Basic Differentiation Skills (Topic 5)
(5, 'Power Rule', 'Differentiate functions using power rule', 1, 1, 90),
(5, 'Product Rule', 'Differentiate products of functions', 2, 2, 80),
(5, 'Chain Rule', 'Differentiate composite functions', 3, 3, 75),

-- Trigonometric Functions Skills (Topic 7)
(7, 'Unit Circle Values', 'Recall trigonometric values for common angles', 1, 1, 95),
(7, 'Graph Trigonometric Functions', 'Sketch sine, cosine and tangent graphs', 2, 2, 80),

-- Forces and Equilibrium Skills (Topic 13)
(13, 'Resolve Forces', 'Break forces into components', 2, 1, 85),
(13, 'Equilibrium Conditions', 'Apply equilibrium conditions to solve problems', 2, 2, 80),

-- Heat Transfer Skills (Topic 15)
(15, 'Conduction Calculations', 'Solve conduction heat transfer problems', 2, 1, 80),
(15, 'Convection Principles', 'Understand convective heat transfer', 2, 2, 75),

-- DC Circuits Skills (Topic 17)
(17, 'Ohm''s Law', 'Apply Ohm''s law to solve circuit problems', 1, 1, 90),
(17, 'Series Circuits', 'Analyze series electrical circuits', 2, 2, 85),
(17, 'Parallel Circuits', 'Analyze parallel electrical circuits', 2, 3, 85);

-- ============================================================
-- QUESTIONS for each Skill
-- ============================================================

-- Questions for Skill 1: Solve Basic Linear Equations
INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) VALUES
(1, 'multiple_choice', 'Solve for x: 2x + 5 = 13', '{"options": ["x = 4", "x = 5", "x = 6", "x = 7"]}', 'x = 4', 'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4', 1, 10),
(1, 'multiple_choice', 'Solve for y: 3y - 7 = 14', '{"options": ["y = 5", "y = 6", "y = 7", "y = 8"]}', 'y = 7', 'Add 7 to both sides: 3y = 21, then divide by 3: y = 7', 1, 10),
(1, 'multiple_choice', 'Solve for x: 4(x - 3) = 20', '{"options": ["x = 5", "x = 6", "x = 7", "x = 8"]}', 'x = 8', 'Divide both sides by 4: x - 3 = 5, then add 3: x = 8', 2, 15),

-- Questions for Skill 2: Solve Equations with Fractions
(2, 'multiple_choice', 'Solve for x: (1/2)x + 3 = 7', '{"options": ["x = 4", "x = 6", "x = 8", "x = 10"]}', 'x = 8', 'Subtract 3: (1/2)x = 4, then multiply by 2: x = 8', 2, 15),
(2, 'multiple_choice', 'Solve for x: (2/3)x - 1 = 5', '{"options": ["x = 6", "x = 7", "x = 8", "x = 9"]}', 'x = 9', 'Add 1: (2/3)x = 6, then multiply by 3/2: x = 9', 2, 15),

-- Questions for Skill 4: Solve by Factoring
(4, 'multiple_choice', 'Solve by factoring: x² + 5x + 6 = 0', '{"options": ["x = -2, -3", "x = 2, 3", "x = -1, -6", "x = 1, 6"]}', 'x = -2, -3', 'Factors: (x + 2)(x + 3) = 0, so x = -2 or x = -3', 2, 15),
(4, 'multiple_choice', 'Solve by factoring: x² - 9 = 0', '{"options": ["x = ±3", "x = ±9", "x = 3 only", "x = 9 only"]}', 'x = ±3', 'Difference of squares: (x - 3)(x + 3) = 0, so x = 3 or x = -3', 2, 15),

-- Questions for Skill 8: Power Rule
(8, 'multiple_choice', 'Find the derivative of f(x) = x⁴', '{"options": ["4x³", "3x⁴", "4x⁴", "x³"]}', '4x³', 'Using power rule: multiply by exponent and reduce exponent by 1', 1, 10),
(8, 'multiple_choice', 'Find the derivative of f(x) = 3x²', '{"options": ["6x", "3x", "6x²", "2x"]}', '6x', 'Derivative of 3x² is 2*3x¹ = 6x', 1, 10),

-- Questions for Skill 13: Resolve Forces
(13, 'multiple_choice', 'A force of 10N acts at 30° to the horizontal. What is its horizontal component?', '{"options": ["8.66N", "5N", "10N", "7.07N"]}', '8.66N', 'Horizontal component = 10 * cos(30°) = 10 * 0.866 = 8.66N', 2, 15),
(13, 'multiple_choice', 'A force of 20N has a vertical component of 10N. What is the angle with the horizontal?', '{"options": ["30°", "45°", "60°", "90°"]}', '30°', 'sin(θ) = 10/20 = 0.5, so θ = 30°', 2, 15),

-- Questions for Skill 17: Ohm's Law
(17, 'multiple_choice', 'If voltage is 12V and resistance is 4Ω, what is the current?', '{"options": ["3A", "4A", "2A", "6A"]}', '3A', 'Using Ohm''s Law: I = V/R = 12/4 = 3A', 1, 10),
(17, 'multiple_choice', 'A current of 2A flows through a 10Ω resistor. What is the voltage?', '{"options": ["20V", "10V", "5V", "2V"]}', '20V', 'Using Ohm''s Law: V = I*R = 2*10 = 20V', 1, 10);

-- ============================================================
-- SKILL PROGRESS (Sample progress for dev-user)
-- ============================================================
INSERT INTO skill_progress (user_id, skill_id, smart_score, questions_attempted, questions_correct, current_streak, best_streak, time_spent_seconds, is_mastered) VALUES
('dev-user', 1, 85, 20, 17, 3, 5, 1200, 1),
('dev-user', 2, 65, 15, 10, 1, 3, 900, 0),
('dev-user', 4, 90, 25, 23, 7, 7, 1500, 1),
('dev-user', 8, 75, 18, 14, 2, 4, 1100, 0),
('dev-user', 13, 55, 12, 7, 0, 2, 800, 0),
('dev-user', 17, 80, 22, 18, 4, 6, 1300, 0);

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
INSERT INTO achievements (name, description, badge_icon_url, achievement_type, criteria_json, points_value) VALUES
('First Steps', 'Complete your first skill practice', '/badges/first-steps.svg', 'milestone', '{"type": "first_practice"}', 50),
('Quick Learner', 'Master a skill in under 24 hours', '/badges/quick-learner.svg', 'speed', '{"type": "fast_mastery", "time_limit_hours": 24}', 100),
('Math Whiz', 'Master 5 mathematics skills', '/badges/math-whiz.svg', 'subject_mastery', '{"type": "subject_mastery", "subject": "math", "count": 5}', 200),
('Perfect Score', 'Get 100% on a practice session', '/badges/perfect-score.svg', 'performance', '{"type": "perfect_session"}', 75),
('Week Warrior', 'Practice for 7 consecutive days', '/badges/week-warrior.svg', 'consistency', '{"type": "streak", "days": 7}', 150);

-- User achievements for dev-user
INSERT INTO user_achievements (user_id, achievement_id) VALUES
('dev-user', 1),
('dev-user', 4);

-- ============================================================
-- DAILY CHALLENGES
-- ============================================================
INSERT INTO daily_challenges (challenge_date, skill_id, target_questions, target_accuracy, xp_reward) VALUES
(date('now'), 2, 5, 70, 100),
(date('now', '+1 day'), 8, 8, 75, 120),
(date('now', '+2 days'), 13, 6, 65, 90);

-- User progress on today's challenge
INSERT INTO user_daily_challenges (user_id, challenge_id, questions_completed, questions_correct, is_completed) VALUES
('dev-user', 1, 3, 2, 0);

-- ============================================================
-- CLASSES AND ENROLLMENTS
-- ============================================================
INSERT INTO classes (teacher_id, institution_id, name, subject_id, class_code) VALUES
('teacher-1', 1, 'Math N4 Group A', 1, 'MATHN4-A2024'),
('teacher-1', 1, 'Engineering Science N4', 2, 'ENGSCI-N4-2024');

INSERT INTO class_enrollments (class_id, student_id) VALUES
(1, 'dev-user'),
(2, 'dev-user');

-- ============================================================
-- SKILL ASSIGNMENTS
-- ============================================================
INSERT INTO skill_assignments (teacher_id, student_id, skill_id, due_date) VALUES
('teacher-1', 'dev-user', 2, date('now', '+7 days')),
('teacher-1', 'dev-user', 8, date('now', '+14 days'));

-- ============================================================
-- PRACTICE SESSIONS (Sample history)
-- ============================================================
INSERT INTO practice_sessions (user_id, skill_id, session_type, start_time, end_time, questions_attempted, questions_correct, final_score, is_completed) VALUES
('dev-user', 1, 'practice', datetime('now', '-2 hours'), datetime('now', '-1 hour'), 10, 8, 80, 1),
('dev-user', 4, 'practice', datetime('now', '-1 day'), datetime('now', '-1 day', '+30 minutes'), 15, 14, 93, 1),
('dev-user', 17, 'practice', datetime('now', '-3 days'), datetime('now', '-3 days', '+45 minutes'), 12, 9, 75, 1);

-- ============================================================
-- QUESTION ATTEMPTS (Sample data)
-- ============================================================
INSERT INTO question_attempts (session_id, question_id, user_id, user_answer, is_correct, time_spent_seconds) VALUES
(1, 1, 'dev-user', 'x = 4', 1, 30),
(1, 2, 'dev-user', 'y = 7', 1, 25),
(1, 3, 'dev-user', 'x = 7', 0, 40),
(2, 7, 'dev-user', 'x = ±3', 1, 35),
(3, 15, 'dev-user', '3A', 1, 20);

-- ============================================================
-- LEADERBOARD ENTRIES
-- ============================================================
INSERT INTO leaderboard_entries (user_id, category, score, rank, period_start, period_end) VALUES
('dev-user', 'weekly_xp', 450, 3, date('now', 'weekday 0', '-7 days'), date('now', 'weekday 0')),
('dev-user', 'mastery_count', 2, 5, date('now', 'start of month'), date('now', 'start of month', '+1 month', '-1 day'));

-- ============================================================
-- VERIFICATION QUERY (Optional - to verify seed data)
-- ============================================================
SELECT 'Seed data completed successfully!' as status;