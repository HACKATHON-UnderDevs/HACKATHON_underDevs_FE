-- Flashcard Generation Schema for Backend Integration
-- This schema supports the new flashcard generation flow with backend API integration
-- Tables created in public schema

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS public.flashcard_study_sessions CASCADE;
DROP TABLE IF EXISTS public.flashcards CASCADE;
DROP TABLE IF EXISTS public.generated_flashcard_sets CASCADE;
DROP TABLE IF EXISTS public.flashcard_submissions CASCADE;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.update_flashcard_updated_at_column() CASCADE;

-- Flashcard Submissions table - stores initial flashcard requests
CREATE TABLE public.flashcard_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    flashcard_title VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    source_material TEXT NOT NULL,
    flashcard_set_id VARCHAR(100) UNIQUE NOT NULL, -- ID sent to backend API
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated Flashcard Sets table - stores completed flashcard sets from backend
CREATE TABLE public.generated_flashcard_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.flashcard_submissions(id) ON DELETE CASCADE,
    flashcard_set_id VARCHAR(100) NOT NULL, -- Matches backend flashcard_set_id
    user_id TEXT NOT NULL, -- Clerk user ID
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    card_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flashcards table - stores individual flashcards from backend
CREATE TABLE public.flashcards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flashcard_set_id UUID REFERENCES public.generated_flashcard_sets(id) ON DELETE CASCADE,
    backend_flashcard_set_id VARCHAR(100) NOT NULL, -- Matches backend flashcard_set_id
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    card_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flashcard Study Sessions table - tracks user study sessions
CREATE TABLE public.flashcard_study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    flashcard_set_id UUID REFERENCES public.generated_flashcard_sets(id) ON DELETE CASCADE,
    cards_studied INTEGER NOT NULL DEFAULT 0,
    cards_correct INTEGER NOT NULL DEFAULT 0,
    accuracy_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    time_taken_seconds INTEGER,
    session_data JSONB, -- Store session details
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_flashcard_submissions_user_id ON public.flashcard_submissions(user_id);
CREATE INDEX idx_flashcard_submissions_flashcard_set_id ON public.flashcard_submissions(flashcard_set_id);
CREATE INDEX idx_flashcard_submissions_status ON public.flashcard_submissions(status);
CREATE INDEX idx_generated_flashcard_sets_user_id ON public.generated_flashcard_sets(user_id);
CREATE INDEX idx_generated_flashcard_sets_flashcard_set_id ON public.generated_flashcard_sets(flashcard_set_id);
CREATE INDEX idx_flashcards_flashcard_set_id ON public.flashcards(flashcard_set_id);
CREATE INDEX idx_flashcards_backend_flashcard_set_id ON public.flashcards(backend_flashcard_set_id);
CREATE INDEX idx_flashcard_study_sessions_user_id ON public.flashcard_study_sessions(user_id);
CREATE INDEX idx_flashcard_study_sessions_flashcard_set_id ON public.flashcard_study_sessions(flashcard_set_id);

-- Create updated_at trigger function
CREATE FUNCTION public.update_flashcard_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_flashcard_submissions_updated_at
    BEFORE UPDATE ON public.flashcard_submissions
    FOR EACH ROW EXECUTE FUNCTION public.update_flashcard_updated_at_column();

CREATE TRIGGER update_generated_flashcard_sets_updated_at
    BEFORE UPDATE ON public.generated_flashcard_sets
    FOR EACH ROW EXECUTE FUNCTION public.update_flashcard_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.flashcard_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user data access
-- Allow anon access for now (using Clerk for auth)
CREATE POLICY "Allow anon access to flashcard submissions" ON public.flashcard_submissions
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to generated flashcard sets" ON public.generated_flashcard_sets
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to flashcards" ON public.flashcards
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to flashcard study sessions" ON public.flashcard_study_sessions
    FOR ALL TO anon USING (true);

-- Grant permissions to public schema tables
GRANT ALL ON public.flashcard_submissions TO anon, authenticated;
GRANT ALL ON public.generated_flashcard_sets TO anon, authenticated;
GRANT ALL ON public.flashcards TO anon, authenticated;
GRANT ALL ON public.flashcard_study_sessions TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;