-- =============================================
-- SUBJECT: Engineering Science N3 - TEST CONTENT
-- =============================================

-- Subject creation
INSERT INTO subjects (name, code, nated_level, description, color_hex, display_order) 
VALUES ('Engineering Science N3', 'ENG-SCI-N3', 'N3', 'Comprehensive engineering science principles including mechanics, thermodynamics, and materials science', '#DC2626', 5);

-- Modules for Engineering Science N3
INSERT INTO modules (subject_id, name, description, display_order) 
SELECT id, 'Statics and Dynamics', 'Analysis of forces, equilibrium, and motion in engineering systems', 1 
FROM subjects WHERE code = 'ENG-SCI-N3';

INSERT INTO modules (subject_id, name, description, display_order) 
SELECT id, 'Strength of Materials', 'Stress, strain, and material behavior under load', 2 
FROM subjects WHERE code = 'ENG-SCI-N3';

INSERT INTO modules (subject_id, name, description, display_order) 
SELECT id, 'Thermodynamics', 'Heat, work, energy transfer and thermodynamic cycles', 3 
FROM subjects WHERE code = 'ENG-SCI-N3';

-- Topics for Statics and Dynamics
INSERT INTO topics (module_id, name, description, display_order) 
SELECT id, 'Force Systems and Equilibrium', 'Analysis of concurrent and non-concurrent force systems', 1 
FROM modules WHERE name = 'Statics and Dynamics' AND subject_id IN (SELECT id FROM subjects WHERE code = 'ENG-SCI-N3');

INSERT INTO topics (module_id, name, description, display_order) 
SELECT id, 'Friction Applications', 'Static and kinetic friction in engineering systems', 2 
FROM modules WHERE name = 'Statics and Dynamics' AND subject_id IN (SELECT id FROM subjects WHERE code = 'ENG-SCI-N3');

-- Skills for Force Systems and Equilibrium
INSERT INTO skills (topic_id, name, description, difficulty_level, mastery_threshold, display_order) 
SELECT id, 'Resolve Forces into Components', 'Break down forces into rectangular components', 2, 85, 1 
FROM topics WHERE name = 'Force Systems and Equilibrium' AND module_id IN (
  SELECT id FROM modules WHERE name = 'Statics and Dynamics' AND subject_id IN (
    SELECT id FROM subjects WHERE code = 'ENG-SCI-N3'
  )
);

INSERT INTO skills (topic_id, name, description, difficulty_level, mastery_threshold, display_order) 
SELECT id, 'Calculate Resultant Forces', 'Determine resultant of multiple force systems', 3, 80, 2 
FROM topics WHERE name = 'Force Systems and Equilibrium' AND module_id IN (
  SELECT id FROM modules WHERE name = 'Statics and Dynamics' AND subject_id IN (
    SELECT id FROM subjects WHERE code = 'ENG-SCI-N3'
  )
);

-- Questions for Resolve Forces into Components
INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'A force of 100 N acts at an angle of 30° to the horizontal. Calculate the horizontal component of this force.',
'{
  "options": [
    "86.6 N", 
    "50.0 N", 
    "100 N", 
    "70.7 N"
  ],
  "diagram": "Force diagram: 100N at 30° → Fx = Fcosθ, Fy = Fsinθ"
}', 
'86.6 N',
'The horizontal component is calculated using Fₓ = F × cos(30°) = 100 × 0.866 = 86.6 N',
2, 15
FROM skills WHERE name = 'Resolve Forces into Components' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Force Systems and Equilibrium' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Statics and Dynamics' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'ENG-SCI-N3'
    )
  )
);

INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'A force of 50 N acts at 60° to the vertical. What is the vertical component?',
'{
  "options": [
    "25.0 N", 
    "43.3 N", 
    "50.0 N", 
    "28.9 N"
  ],
  "diagram": "Force diagram: 50N at 60° from vertical"
}', 
'25.0 N',
'Vertical component = F × cos(60°) = 50 × 0.5 = 25.0 N',
2, 15
FROM skills WHERE name = 'Resolve Forces into Components' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Force Systems and Equilibrium' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Statics and Dynamics' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'ENG-SCI-N3'
    )
  )
);

-- Questions for Calculate Resultant Forces
INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) 
SELECT id, 'multiple_choice', 
'Two forces act on a point: 40 N east and 30 N north. What is the magnitude of the resultant force?',
'{
  "options": [
    "50 N", 
    "70 N", 
    "10 N", 
    "35 N"
  ],
  "diagram": "Vector addition: 40N → + 30N ↑ = Resultant"
}', 
'50 N',
'Resultant R = √(40² + 30²) = √(1600 + 900) = √2500 = 50 N',
3, 20
FROM skills WHERE name = 'Calculate Resultant Forces' AND topic_id IN (
  SELECT id FROM topics WHERE name = 'Force Systems and Equilibrium' AND module_id IN (
    SELECT id FROM modules WHERE name = 'Statics and Dynamics' AND subject_id IN (
      SELECT id FROM subjects WHERE code = 'ENG-SCI-N3'
    )
  )
);