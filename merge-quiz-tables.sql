-- Script to merge generated_quizzes and ai_generation.quiz_sets tables
-- This script consolidates the two quiz table structures into a unified approach

-- Step 1: Create a backup of existing data
CREATE TABLE IF NOT EXISTS public.quiz_backup_generated AS 
SELECT * FROM public.generated_quizzes;

CREATE TABLE IF NOT EXISTS public.quiz_backup_ai_sets AS 
SELECT * FROM ai_generation.quiz_sets;

-- Step 2: Create the unified quizzes table
DROP TABLE IF EXISTS public.quizzes CASCADE;

CREATE TABLE public.quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100),
    
    -- Fields from generated_quizzes
    submission_id UUID, -- Reference to quiz_submissions if applicable
    quiz_id VARCHAR(100), -- Backend quiz ID for API integration
    note_id VARCHAR(100), -- Reference to the note this quiz was generated from
    question_count INTEGER NOT NULL DEFAULT 0,
    
    -- Fields from ai_generation.quiz_sets
    source_material_id UUID, -- Reference to ai_generation.source_materials
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    tags TEXT[],
    time_limit_minutes INTEGER,
    generation_settings JSONB, -- Store generation parameters
    
    -- Common fields
    quiz_type VARCHAR(50) DEFAULT 'generated' CHECK (quiz_type IN ('generated', 'ai_set', 'manual')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Migrate data from generated_quizzes
INSERT INTO public.quizzes (
    user_id, title, subject, submission_id, quiz_id, note_id, 
    question_count, quiz_type, created_at, updated_at
)
SELECT 
    user_id, 
    title, 
    subject, 
    submission_id, 
    quiz_id, 
    note_id,
    question_count,
    'generated' as quiz_type,
    created_at, 
    updated_at
FROM public.generated_quizzes;

-- Step 4: Migrate data from ai_generation.quiz_sets
INSERT INTO public.quizzes (
    user_id, title, description, subject, source_material_id, 
    difficulty_level, question_count, tags, time_limit_minutes, 
    generation_settings, quiz_type, created_at, updated_at
)
SELECT 
    user_id, 
    title, 
    description, 
    subject, 
    source_material_id,
    difficulty_level,
    question_count,
    tags,
    time_limit_minutes,
    generation_settings,
    'ai_set' as quiz_type,
    created_at, 
    updated_at
FROM ai_generation.quiz_sets;

-- Step 5: Update foreign key references
-- Update quiz_questions to reference the new quizzes table
ALTER TABLE public.quiz_questions 
DROP CONSTRAINT IF EXISTS quiz_questions_quiz_id_fkey;

-- Add a new column to map to the unified quizzes table
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS unified_quiz_id UUID;

-- Update the mapping for generated quizzes
UPDATE public.quiz_questions 
SET unified_quiz_id = q.id
FROM public.quizzes q, public.generated_quizzes gq
WHERE public.quiz_questions.quiz_id = gq.id 
AND q.quiz_id = gq.quiz_id 
AND q.quiz_type = 'generated';

-- Note: ai_generation.quiz_questions table does not exist
-- Skipping quiz_questions update for ai_generation schema

-- Step 6: Update quiz_attempts references
ALTER TABLE public.quiz_attempts 
ADD COLUMN IF NOT EXISTS unified_quiz_id UUID;

UPDATE public.quiz_attempts 
SET unified_quiz_id = q.id
FROM public.quizzes q, public.generated_quizzes gq
WHERE public.quiz_attempts.quiz_id = gq.id 
AND q.quiz_id = gq.quiz_id 
AND q.quiz_type = 'generated';

-- Note: ai_generation.quiz_attempts table does not exist
-- Skipping quiz_attempts update for ai_generation schema

-- Step 7: Create indexes for the unified table
CREATE INDEX idx_quizzes_user_id ON public.quizzes(user_id);
CREATE INDEX idx_quizzes_quiz_id ON public.quizzes(quiz_id);
CREATE INDEX idx_quizzes_note_id ON public.quizzes(note_id);
CREATE INDEX idx_quizzes_source_material_id ON public.quizzes(source_material_id);
CREATE INDEX idx_quizzes_quiz_type ON public.quizzes(quiz_type);
CREATE INDEX idx_quizzes_status ON public.quizzes(status);
CREATE INDEX idx_quizzes_created_at ON public.quizzes(created_at DESC);

-- Step 8: Create updated_at trigger
CREATE TRIGGER update_quizzes_updated_at
    BEFORE UPDATE ON public.quizzes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Step 9: Enable RLS and create policies
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon access to quizzes" ON public.quizzes
    FOR ALL TO anon USING (true);

CREATE POLICY "Users can access their own quizzes" ON public.quizzes
    FOR ALL TO authenticated USING (auth.jwt() ->> 'sub' = user_id);

-- Step 10: Grant permissions
GRANT ALL ON public.quizzes TO anon, authenticated;

-- Step 11: Create a view to show quiz relationships and data
CREATE OR REPLACE VIEW public.quiz_overview AS
SELECT 
    q.id,
    q.user_id,
    q.title,
    q.description,
    q.subject,
    q.quiz_type,
    q.status,
    q.question_count,
    q.difficulty_level,
    q.time_limit_minutes,
    q.note_id,
    q.quiz_id as backend_quiz_id,
    sm.title as source_material_title,
    qs.title as submission_title,
    q.created_at,
    q.updated_at,
    -- Count actual questions
    COALESCE(pqc.question_count, 0) + COALESCE(aqc.question_count, 0) as actual_question_count,
    -- Count attempts
    COALESCE(pac.attempt_count, 0) + COALESCE(aac.attempt_count, 0) as total_attempts
FROM public.quizzes q
LEFT JOIN ai_generation.source_materials sm ON q.source_material_id = sm.id
LEFT JOIN public.quiz_submissions qs ON q.submission_id = qs.id
LEFT JOIN (
    SELECT unified_quiz_id, COUNT(*) as question_count 
    FROM public.quiz_questions 
    WHERE unified_quiz_id IS NOT NULL 
    GROUP BY unified_quiz_id
) pqc ON q.id = pqc.unified_quiz_id
-- Note: ai_generation.quiz_questions does not exist, using NULL
LEFT JOIN (
    SELECT NULL::UUID as unified_quiz_id, 0 as question_count 
    WHERE FALSE
) aqc ON q.id = aqc.unified_quiz_id
LEFT JOIN (
    SELECT unified_quiz_id, COUNT(*) as attempt_count 
    FROM public.quiz_attempts 
    WHERE unified_quiz_id IS NOT NULL 
    GROUP BY unified_quiz_id
) pac ON q.id = pac.unified_quiz_id
-- Note: ai_generation.quiz_attempts does not exist, using NULL
LEFT JOIN (
    SELECT NULL::UUID as unified_quiz_id, 0 as attempt_count 
    WHERE FALSE
) aac ON q.id = aac.unified_quiz_id;

-- Grant access to the view
GRANT SELECT ON public.quiz_overview TO anon, authenticated;

-- Step 12: Optional - Drop old tables after verification
-- UNCOMMENT THESE LINES AFTER VERIFYING THE MIGRATION IS SUCCESSFUL
-- DROP TABLE public.generated_quizzes CASCADE;
-- DROP TABLE ai_generation.quiz_sets CASCADE;

-- Migration complete!
-- The unified 'quizzes' table now contains all quiz data
-- Use the 'quiz_overview' view to see consolidated quiz information