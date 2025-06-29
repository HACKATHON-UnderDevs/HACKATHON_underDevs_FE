-- Remove Quiz-related tables and dependencies from Supabase schema
-- This script removes quiz functionality since we're now using a self-hosted API backend

-- Drop RLS policies first
DROP POLICY IF EXISTS "Allow anon access to quiz sets" ON ai_generation.quiz_sets;
DROP POLICY IF EXISTS "Allow anon access to quiz questions" ON ai_generation.quiz_questions;
DROP POLICY IF EXISTS "Allow anon access to quiz attempts" ON ai_generation.quiz_attempts;
DROP POLICY IF EXISTS "Users can access their own quiz sets" ON ai_generation.quiz_sets;
DROP POLICY IF EXISTS "Users can access questions from their quiz sets" ON ai_generation.quiz_questions;
DROP POLICY IF EXISTS "Users can access their own quiz attempts" ON ai_generation.quiz_attempts;

-- Drop triggers
DROP TRIGGER IF EXISTS update_quiz_sets_updated_at ON ai_generation.quiz_sets;

-- Drop indexes
DROP INDEX IF EXISTS ai_generation.idx_quiz_sets_user_id;
DROP INDEX IF EXISTS ai_generation.idx_quiz_sets_source_material;
DROP INDEX IF EXISTS ai_generation.idx_quiz_attempts_user_id;

-- Drop tables (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS ai_generation.quiz_attempts;
DROP TABLE IF EXISTS ai_generation.quiz_questions;
DROP TABLE IF EXISTS ai_generation.quiz_sets;

-- Update user_progress table to remove quiz-related columns
ALTER TABLE ai_generation.user_progress 
DROP COLUMN IF EXISTS total_quizzes_created,
DROP COLUMN IF EXISTS total_quiz_attempts,
DROP COLUMN IF EXISTS average_quiz_score;

COMMIT;