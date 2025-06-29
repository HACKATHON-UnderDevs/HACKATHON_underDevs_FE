-- Update RLS policies to allow anon access for Clerk authentication
-- Run this in your Supabase SQL editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can access their own source materials" ON ai_generation.source_materials;
DROP POLICY IF EXISTS "Users can access their own flashcard sets" ON ai_generation.flashcard_sets;
DROP POLICY IF EXISTS "Users can access flashcards from their sets" ON ai_generation.flashcards;
DROP POLICY IF EXISTS "Users can access their own quiz sets" ON ai_generation.quiz_sets;
DROP POLICY IF EXISTS "Users can access questions from their quiz sets" ON ai_generation.quiz_questions;
DROP POLICY IF EXISTS "Users can access their own study sessions" ON ai_generation.study_sessions;
DROP POLICY IF EXISTS "Users can access their own quiz attempts" ON ai_generation.quiz_attempts;
DROP POLICY IF EXISTS "Users can access their own progress" ON ai_generation.user_progress;

-- Create new policies that allow anon access (for Clerk authentication)
CREATE POLICY "Allow anon access to source materials" ON ai_generation.source_materials
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to flashcard sets" ON ai_generation.flashcard_sets
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to flashcards" ON ai_generation.flashcards
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to quiz sets" ON ai_generation.quiz_sets
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to quiz questions" ON ai_generation.quiz_questions
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to study sessions" ON ai_generation.study_sessions
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to quiz attempts" ON ai_generation.quiz_attempts
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to user progress" ON ai_generation.user_progress
    FOR ALL TO anon USING (true);

-- Create authenticated user policies (for future Supabase auth integration)
CREATE POLICY "Users can access their own source materials" ON ai_generation.source_materials
    FOR ALL TO authenticated USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can access their own flashcard sets" ON ai_generation.flashcard_sets
    FOR ALL TO authenticated USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can access flashcards from their sets" ON ai_generation.flashcards
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM ai_generation.flashcard_sets fs 
            WHERE fs.id = flashcard_set_id AND fs.user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can access their own quiz sets" ON ai_generation.quiz_sets
    FOR ALL TO authenticated USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can access questions from their quiz sets" ON ai_generation.quiz_questions
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM ai_generation.quiz_sets qs 
            WHERE qs.id = quiz_set_id AND qs.user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can access their own study sessions" ON ai_generation.study_sessions
    FOR ALL TO authenticated USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can access their own quiz attempts" ON ai_generation.quiz_attempts
    FOR ALL TO authenticated USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can access their own progress" ON ai_generation.user_progress
    FOR ALL TO authenticated USING (auth.jwt() ->> 'sub' = user_id);

-- Verify policies are created
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'ai_generation' 
ORDER BY tablename, policyname;