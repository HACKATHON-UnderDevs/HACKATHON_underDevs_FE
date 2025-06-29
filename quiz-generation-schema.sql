-- Quiz Generation Schema for Backend Integration
-- This schema supports the new quiz generation flow with backend API integration
-- Tables created in public schema

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.quiz_answers CASCADE;
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.generated_quizzes CASCADE;
DROP TABLE IF EXISTS public.quiz_submissions CASCADE;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Quiz Submissions table - stores initial quiz requests
CREATE TABLE public.quiz_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    quiz_title VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    source_material TEXT NOT NULL,
    quiz_id VARCHAR(100) UNIQUE NOT NULL, -- ID sent to backend API
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated Quizzes table - stores completed quizzes from backend
CREATE TABLE public.generated_quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.quiz_submissions(id) ON DELETE CASCADE,
    quiz_id VARCHAR(100) NOT NULL, -- Matches backend quiz_id
    user_id TEXT NOT NULL, -- Clerk user ID
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    question_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Questions table - stores individual questions from backend
CREATE TABLE public.quiz_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID REFERENCES public.generated_quizzes(id) ON DELETE CASCADE,
    backend_quiz_id VARCHAR(100) NOT NULL, -- Matches backend quiz_id
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'multiple_choice',
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Answers table - stores answer options for each question
CREATE TABLE public.quiz_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    answer_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Attempts table - tracks user quiz attempts
CREATE TABLE public.quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    quiz_id UUID REFERENCES public.generated_quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    time_taken_seconds INTEGER,
    answers JSONB, -- Store user answers
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_quiz_submissions_user_id ON public.quiz_submissions(user_id);
CREATE INDEX idx_quiz_submissions_quiz_id ON public.quiz_submissions(quiz_id);
CREATE INDEX idx_quiz_submissions_status ON public.quiz_submissions(status);
CREATE INDEX idx_generated_quizzes_user_id ON public.generated_quizzes(user_id);
CREATE INDEX idx_generated_quizzes_quiz_id ON public.generated_quizzes(quiz_id);
CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_backend_quiz_id ON public.quiz_questions(backend_quiz_id);
CREATE INDEX idx_quiz_answers_question_id ON public.quiz_answers(question_id);
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);

-- Create updated_at trigger function
CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_quiz_submissions_updated_at
    BEFORE UPDATE ON public.quiz_submissions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_generated_quizzes_updated_at
    BEFORE UPDATE ON public.generated_quizzes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user data access
-- Allow anon access for now (using Clerk for auth)
CREATE POLICY "Allow anon access to quiz submissions" ON public.quiz_submissions
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to generated quizzes" ON public.generated_quizzes
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to quiz questions" ON public.quiz_questions
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to quiz answers" ON public.quiz_answers
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to quiz attempts" ON public.quiz_attempts
    FOR ALL TO anon USING (true);

-- Grant permissions to public schema tables
GRANT ALL ON public.quiz_submissions TO anon, authenticated;
GRANT ALL ON public.generated_quizzes TO anon, authenticated;
GRANT ALL ON public.quiz_questions TO anon, authenticated;
GRANT ALL ON public.quiz_answers TO anon, authenticated;
GRANT ALL ON public.quiz_attempts TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;