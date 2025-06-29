-- Simple SQL script to add note_id column to generated_quizzes table
-- This script only adds the column without any foreign key relationships

-- Add note_id column to generated_quizzes table
ALTER TABLE public.generated_quizzes 
ADD COLUMN IF NOT EXISTS note_id VARCHAR(100);

-- Add comment to document the field
COMMENT ON COLUMN public.generated_quizzes.note_id IS 
    'Reference to the note or quiz ID this generated quiz is based on.';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_generated_quizzes_note_id 
ON public.generated_quizzes(note_id);