-- SQL script to add note_id column and create relation to quiz_sets table

-- Step 1: Add note_id column to generated_quizzes table (if not already added)
-- This is safe to run multiple times due to IF NOT EXISTS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'generated_quizzes' 
        AND column_name = 'note_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.generated_quizzes 
        ADD COLUMN note_id UUID;
        
        -- Add comment to document the relationship
        COMMENT ON COLUMN public.generated_quizzes.note_id IS 
            'Reference to the quiz set ID this generated quiz is based on. Links to ai_generation.quiz_sets.id.';
    END IF;
END $$;

-- Step 2: Create foreign key relationship between note_id and quiz_sets.id
-- This creates a relationship from generated_quizzes to quiz_sets table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_generated_quizzes_note_id'
        AND table_name = 'generated_quizzes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.generated_quizzes 
        ADD CONSTRAINT fk_generated_quizzes_note_id 
        FOREIGN KEY (note_id) REFERENCES ai_generation.quiz_sets(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Step 3: Create index for performance (if not already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_generated_quizzes_note_id'
        AND tablename = 'generated_quizzes'
        AND schemaname = 'public'
    ) THEN
        CREATE INDEX idx_generated_quizzes_note_id 
        ON public.generated_quizzes(note_id);
    END IF;
END $$;

-- Step 4: Create a view to show quiz relationships
CREATE OR REPLACE VIEW public.quiz_relationships AS
SELECT 
    gq.id as generated_quiz_id,
    gq.quiz_id as generated_quiz_backend_id,
    gq.title as generated_quiz_title,
    gq.note_id,
    qs.id as quiz_set_id,
    qs.title as quiz_set_title,
    qs.description as quiz_set_description,
    qs.difficulty_level,
    qs.question_count as quiz_set_question_count,
    gq.user_id,
    gq.created_at as generated_quiz_created_at,
    qs.created_at as quiz_set_created_at
FROM public.generated_quizzes gq
LEFT JOIN ai_generation.quiz_sets qs ON gq.note_id = qs.id
ORDER BY gq.created_at DESC;

-- Grant permissions
GRANT SELECT ON public.quiz_relationships TO anon, authenticated;