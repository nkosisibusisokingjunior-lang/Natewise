-- Add questions for skill 13 (Solve Basic Linear Equations)
INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) VALUES 
(13, 'multiple_choice', 'Solve for x: 2x + 5 = 13', '{"options": ["x = 4", "x = 5", "x = 6", "x = 7"]}', 'x = 4', 'Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4', 1, 10),
(13, 'multiple_choice', 'Solve for y: 3y - 7 = 14', '{"options": ["y = 5", "y = 6", "y = 7", "y = 8"]}', 'y = 7', 'Add 7 to both sides: 3y = 21, then divide by 3: y = 7', 1, 10),
(13, 'multiple_choice', 'Solve for x: 4(x - 3) = 20', '{"options": ["x = 5", "x = 6", "x = 7", "x = 8"]}', 'x = 8', 'Divide both sides by 4: x - 3 = 5, then add 3: x = 8', 2, 15);

-- Add questions for skill 30 (Ohm's Law)
INSERT INTO questions (skill_id, question_type, question_text, question_data, correct_answer, explanation, difficulty_rating, points_value) VALUES 
(30, 'multiple_choice', 'If voltage is 12V and resistance is 4Ω, what is the current?', '{"options": ["3A", "4A", "2A", "6A"]}', '3A', 'Using Ohm''s Law: I = V/R = 12/4 = 3A', 1, 10),
(30, 'multiple_choice', 'A current of 2A flows through a 10Ω resistor. What is the voltage?', '{"options": ["20V", "10V", "5V", "2V"]}', '20V', 'Using Ohm''s Law: V = I*R = 2*10 = 20V', 1, 10),
(30, 'multiple_choice', 'If voltage is 24V and current is 3A, what is the resistance?', '{"options": ["8Ω", "6Ω", "12Ω", "4Ω"]}', '8Ω', 'Using Ohm''s Law: R = V/I = 24/3 = 8Ω', 2, 15);