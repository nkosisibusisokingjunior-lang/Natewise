-- Add time_spent_minutes column to skill_progress table
ALTER TABLE skill_progress ADD COLUMN time_spent_minutes INTEGER DEFAULT 0;

-- Update existing records with estimated time (2 minutes per question)
UPDATE skill_progress SET time_spent_minutes = questions_attempted * 2 WHERE time_spent_minutes = 0;