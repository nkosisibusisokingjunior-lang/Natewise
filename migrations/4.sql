-- Add time_spent_seconds column to practice_sessions table
ALTER TABLE practice_sessions ADD COLUMN time_spent_seconds INTEGER DEFAULT 0;

-- Update existing records with estimated time (2 minutes per question)
UPDATE practice_sessions SET time_spent_seconds = questions_attempted * 120 WHERE time_spent_seconds = 0;