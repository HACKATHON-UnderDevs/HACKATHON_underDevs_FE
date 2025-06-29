-- AI Generation Schema for Luna Learning Platform
-- This schema supports smart flashcard and quiz generation features

-- Create schema for AI generation features
CREATE SCHEMA IF NOT EXISTS ai_generation;

-- Source Materials table - stores the original content used for generation
CREATE TABLE ai_generation.source_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text', -- text, document, url, etc.
    subject VARCHAR(100),
    tags TEXT[], -- Array of tags for categorization
    word_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flashcard Sets table - stores generated flashcard collections
CREATE TABLE ai_generation.flashcard_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_material_id UUID REFERENCES ai_generation.source_materials(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Clerk user ID
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    card_count INTEGER NOT NULL,
    subject VARCHAR(100),
    tags TEXT[],
    generation_settings JSONB, -- Store generation parameters
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual Flashcards table
CREATE TABLE ai_generation.flashcards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flashcard_set_id UUID REFERENCES ai_generation.flashcard_sets(id) ON DELETE CASCADE,
    front_text TEXT NOT NULL,
    back_text TEXT NOT NULL,
    card_order INTEGER NOT NULL,
    difficulty_score DECIMAL(3,2), -- AI-generated difficulty score
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Sets table - stores generated quiz collections
CREATE TABLE ai_generation.quiz_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_material_id UUID REFERENCES ai_generation.source_materials(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Clerk user ID
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    question_count INTEGER NOT NULL,
    subject VARCHAR(100),
    tags TEXT[],
    time_limit_minutes INTEGER,
    generation_settings JSONB, -- Store generation parameters
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz Questions table
CREATE TABLE ai_generation.quiz_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_set_id UUID REFERENCES ai_generation.quiz_sets(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) CHECK (question_type IN ('multiple-choice', 'true-false', 'short-answer', 'essay')),
    correct_answer TEXT NOT NULL,
    options JSONB, -- For multiple choice questions
    explanation TEXT,
    points INTEGER DEFAULT 1,
    question_order INTEGER NOT NULL,
    difficulty_score DECIMAL(3,2), -- AI-generated difficulty score
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Sessions table - tracks user interactions with flashcards
CREATE TABLE ai_generation.study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    flashcard_set_id UUID REFERENCES ai_generation.flashcard_sets(id) ON DELETE CASCADE,
    session_type VARCHAR(20) CHECK (session_type IN ('study', 'review', 'test')),
    cards_studied INTEGER DEFAULT 0,
    cards_correct INTEGER DEFAULT 0,
    session_duration_seconds INTEGER,
    accuracy_percentage DECIMAL(5,2),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Quiz Attempts table - tracks user quiz attempts
CREATE TABLE ai_generation.quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    quiz_set_id UUID REFERENCES ai_generation.quiz_sets(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    time_taken_seconds INTEGER,
    answers JSONB, -- Store user answers
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Progress table - tracks overall learning progress
CREATE TABLE ai_generation.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
    total_flashcards_created INTEGER DEFAULT 0,
    total_quizzes_created INTEGER DEFAULT 0,
    total_study_sessions INTEGER DEFAULT 0,
    total_quiz_attempts INTEGER DEFAULT 0,
    average_flashcard_accuracy DECIMAL(5,2),
    average_quiz_score DECIMAL(5,2),
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_source_materials_user_id ON ai_generation.source_materials(user_id);
CREATE INDEX idx_source_materials_created_at ON ai_generation.source_materials(created_at DESC);
CREATE INDEX idx_flashcard_sets_user_id ON ai_generation.flashcard_sets(user_id);
CREATE INDEX idx_flashcard_sets_source_material ON ai_generation.flashcard_sets(source_material_id);
CREATE INDEX idx_quiz_sets_user_id ON ai_generation.quiz_sets(user_id);
CREATE INDEX idx_quiz_sets_source_material ON ai_generation.quiz_sets(source_material_id);
CREATE INDEX idx_study_sessions_user_id ON ai_generation.study_sessions(user_id);
CREATE INDEX idx_quiz_attempts_user_id ON ai_generation.quiz_attempts(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION ai_generation.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_source_materials_updated_at
    BEFORE UPDATE ON ai_generation.source_materials
    FOR EACH ROW EXECUTE FUNCTION ai_generation.update_updated_at_column();

CREATE TRIGGER update_flashcard_sets_updated_at
    BEFORE UPDATE ON ai_generation.flashcard_sets
    FOR EACH ROW EXECUTE FUNCTION ai_generation.update_updated_at_column();

CREATE TRIGGER update_quiz_sets_updated_at
    BEFORE UPDATE ON ai_generation.quiz_sets
    FOR EACH ROW EXECUTE FUNCTION ai_generation.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON ai_generation.user_progress
    FOR EACH ROW EXECUTE FUNCTION ai_generation.update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE ai_generation.source_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation.flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation.quiz_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user data access
-- Note: These policies are designed for Supabase auth, but we're using Clerk
-- For now, we'll allow anon access and rely on application-level security
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

-- Authenticated user policies (for future Supabase auth integration)
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA ai_generation TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA ai_generation TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ai_generation TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA ai_generation TO authenticated;

-- Grant basic permissions to anon role for connection testing
GRANT USAGE ON SCHEMA ai_generation TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA ai_generation TO anon;