-- Study Schedule Schema for Luna Learning Platform
-- This schema supports intelligent study scheduling with AI-powered recommendations

-- Create schema for study scheduling features
CREATE SCHEMA IF NOT EXISTS study_schedule;

-- Study Plans table - stores user's overall study plans
CREATE TABLE study_schedule.study_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    goal_type VARCHAR(50) CHECK (goal_type IN ('exam_prep', 'skill_building', 'review', 'general')),
    target_hours_per_week INTEGER DEFAULT 10,
    difficulty_preference VARCHAR(20) CHECK (difficulty_preference IN ('easy', 'medium', 'hard', 'adaptive')),
    is_active BOOLEAN DEFAULT true,
    ai_recommendations JSONB, -- AI-generated study recommendations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Sessions table - individual study sessions
CREATE TABLE study_schedule.study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    study_plan_id UUID REFERENCES study_schedule.study_plans(id) ON DELETE CASCADE,
    flashcard_set_id UUID REFERENCES ai_generation.flashcard_sets(id) ON DELETE SET NULL,
    quiz_set_id UUID REFERENCES ai_generation.quiz_sets(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    session_type VARCHAR(30) CHECK (session_type IN ('flashcard_review', 'quiz_practice', 'spaced_repetition', 'intensive_review', 'mixed_practice')),
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_duration_minutes INTEGER NOT NULL,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    actual_duration_minutes INTEGER,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'in_progress', 'completed', 'skipped', 'cancelled')) DEFAULT 'scheduled',
    items_studied INTEGER DEFAULT 0,
    items_correct INTEGER DEFAULT 0,
    accuracy_percentage DECIMAL(5,2),
    difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
    user_feedback TEXT,
    ai_generated BOOLEAN DEFAULT false, -- Whether this session was AI-scheduled
    priority_score DECIMAL(5,2), -- AI-calculated priority
    retention_prediction DECIMAL(5,2), -- AI prediction of retention rate
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Reminders table - AI-powered reminder system
CREATE TABLE study_schedule.study_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    study_session_id UUID REFERENCES study_schedule.study_sessions(id) ON DELETE CASCADE,
    reminder_type VARCHAR(30) CHECK (reminder_type IN ('session_start', 'break_reminder', 'review_due', 'streak_maintenance')),
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    message TEXT NOT NULL,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spaced Repetition Cards table - tracks individual card review schedules
CREATE TABLE study_schedule.spaced_repetition_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    flashcard_id UUID REFERENCES ai_generation.flashcards(id) ON DELETE CASCADE,
    ease_factor DECIMAL(4,2) DEFAULT 2.5, -- Spaced repetition ease factor
    interval_days INTEGER DEFAULT 1, -- Days until next review
    repetitions INTEGER DEFAULT 0, -- Number of successful repetitions
    next_review_date DATE NOT NULL,
    last_reviewed_date DATE,
    last_performance INTEGER CHECK (last_performance BETWEEN 0 AND 5), -- 0=fail, 5=perfect
    total_reviews INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    average_response_time_ms INTEGER,
    difficulty_adjustments INTEGER DEFAULT 0, -- AI adjustments to difficulty
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Analytics table - aggregated performance data
CREATE TABLE study_schedule.study_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    date DATE NOT NULL,
    total_study_time_minutes INTEGER DEFAULT 0,
    sessions_completed INTEGER DEFAULT 0,
    sessions_scheduled INTEGER DEFAULT 0,
    items_reviewed INTEGER DEFAULT 0,
    items_correct INTEGER DEFAULT 0,
    average_accuracy DECIMAL(5,2),
    streak_days INTEGER DEFAULT 0,
    peak_performance_hour INTEGER, -- Hour of day with best performance
    subjects_studied TEXT[], -- Array of subjects studied
    ai_insights JSONB, -- AI-generated insights about performance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- AI Learning Patterns table - stores AI analysis of user learning patterns
CREATE TABLE study_schedule.ai_learning_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    pattern_type VARCHAR(50) CHECK (pattern_type IN ('optimal_time', 'difficulty_preference', 'session_length', 'break_frequency', 'subject_affinity')),
    pattern_data JSONB NOT NULL, -- Detailed pattern analysis
    confidence_score DECIMAL(5,2), -- AI confidence in this pattern
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, pattern_type)
);

-- Study Goals table - user-defined and AI-suggested goals
CREATE TABLE study_schedule.study_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    study_plan_id UUID REFERENCES study_schedule.study_plans(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) CHECK (goal_type IN ('daily_time', 'weekly_sessions', 'accuracy_target', 'streak_maintenance', 'subject_mastery')),
    target_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0,
    target_date DATE,
    is_achieved BOOLEAN DEFAULT false,
    achieved_date DATE,
    ai_suggested BOOLEAN DEFAULT false,
    priority INTEGER CHECK (priority BETWEEN 1 AND 5) DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_study_plans_user_id ON study_schedule.study_plans(user_id);
CREATE INDEX idx_study_plans_active ON study_schedule.study_plans(user_id, is_active);
CREATE INDEX idx_study_sessions_user_id ON study_schedule.study_sessions(user_id);
CREATE INDEX idx_study_sessions_scheduled ON study_schedule.study_sessions(user_id, scheduled_start);
CREATE INDEX idx_study_sessions_status ON study_schedule.study_sessions(user_id, status);
CREATE INDEX idx_study_reminders_user_id ON study_schedule.study_reminders(user_id);
CREATE INDEX idx_study_reminders_scheduled ON study_schedule.study_reminders(scheduled_time, is_sent);
CREATE INDEX idx_spaced_repetition_user_id ON study_schedule.spaced_repetition_cards(user_id);
CREATE INDEX idx_spaced_repetition_review_date ON study_schedule.spaced_repetition_cards(user_id, next_review_date);
CREATE INDEX idx_study_analytics_user_date ON study_schedule.study_analytics(user_id, date);
CREATE INDEX idx_ai_learning_patterns_user_id ON study_schedule.ai_learning_patterns(user_id);
CREATE INDEX idx_study_goals_user_id ON study_schedule.study_goals(user_id);

-- Create updated_at trigger function for study_schedule schema
CREATE OR REPLACE FUNCTION study_schedule.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_study_plans_updated_at
    BEFORE UPDATE ON study_schedule.study_plans
    FOR EACH ROW EXECUTE FUNCTION study_schedule.update_updated_at_column();

CREATE TRIGGER update_study_sessions_updated_at
    BEFORE UPDATE ON study_schedule.study_sessions
    FOR EACH ROW EXECUTE FUNCTION study_schedule.update_updated_at_column();

CREATE TRIGGER update_spaced_repetition_cards_updated_at
    BEFORE UPDATE ON study_schedule.spaced_repetition_cards
    FOR EACH ROW EXECUTE FUNCTION study_schedule.update_updated_at_column();

CREATE TRIGGER update_study_goals_updated_at
    BEFORE UPDATE ON study_schedule.study_goals
    FOR EACH ROW EXECUTE FUNCTION study_schedule.update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE study_schedule.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_schedule.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_schedule.study_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_schedule.spaced_repetition_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_schedule.study_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_schedule.ai_learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_schedule.study_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anonymous access (using Clerk for auth)
CREATE POLICY "Allow anon access to study plans" ON study_schedule.study_plans
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to study sessions" ON study_schedule.study_sessions
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to study reminders" ON study_schedule.study_reminders
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to spaced repetition cards" ON study_schedule.spaced_repetition_cards
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to study analytics" ON study_schedule.study_analytics
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to ai learning patterns" ON study_schedule.ai_learning_patterns
    FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon access to study goals" ON study_schedule.study_goals
    FOR ALL TO anon USING (true);

-- AI-powered functions for intelligent scheduling

-- Function to calculate optimal study time based on user patterns
CREATE OR REPLACE FUNCTION study_schedule.get_optimal_study_time(p_user_id TEXT)
RETURNS TABLE(
    optimal_hour INTEGER,
    confidence_score DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (pattern_data->>'optimal_hour')::INTEGER as optimal_hour,
        alp.confidence_score
    FROM study_schedule.ai_learning_patterns alp
    WHERE alp.user_id = p_user_id 
    AND alp.pattern_type = 'optimal_time'
    AND alp.is_active = true
    ORDER BY alp.confidence_score DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate spaced repetition schedule
CREATE OR REPLACE FUNCTION study_schedule.calculate_next_review(
    p_ease_factor DECIMAL(4,2),
    p_interval_days INTEGER,
    p_performance INTEGER
)
RETURNS TABLE(
    new_ease_factor DECIMAL(4,2),
    new_interval_days INTEGER
) AS $$
DECLARE
    v_ease_factor DECIMAL(4,2);
    v_interval INTEGER;
BEGIN
    -- SM-2 algorithm implementation
    IF p_performance >= 3 THEN
        -- Correct response
        IF p_interval_days = 1 THEN
            v_interval := 6;
        ELSE
            v_interval := ROUND(p_interval_days * p_ease_factor);
        END IF;
        
        v_ease_factor := p_ease_factor + (0.1 - (5 - p_performance) * (0.08 + (5 - p_performance) * 0.02));
        v_ease_factor := GREATEST(v_ease_factor, 1.3);
    ELSE
        -- Incorrect response
        v_interval := 1;
        v_ease_factor := p_ease_factor;
    END IF;
    
    RETURN QUERY SELECT v_ease_factor, v_interval;
END;
$$ LANGUAGE plpgsql;

-- Function to generate AI study recommendations
CREATE OR REPLACE FUNCTION study_schedule.generate_ai_recommendations(p_user_id TEXT)
RETURNS JSONB AS $$
DECLARE
    v_recommendations JSONB := '{}'::JSONB;
    v_avg_accuracy DECIMAL(5,2);
    v_study_streak INTEGER;
    v_weak_subjects TEXT[];
BEGIN
    -- Get user's average accuracy from recent sessions
    SELECT AVG(accuracy_percentage) INTO v_avg_accuracy
    FROM study_schedule.study_sessions
    WHERE user_id = p_user_id 
    AND actual_end >= NOW() - INTERVAL '7 days'
    AND status = 'completed';
    
    -- Get current study streak
    SELECT streak_days INTO v_study_streak
    FROM study_schedule.study_analytics
    WHERE user_id = p_user_id
    ORDER BY date DESC
    LIMIT 1;
    
    -- Identify weak subjects (accuracy < 75%)
    SELECT ARRAY_AGG(DISTINCT fs.subject) INTO v_weak_subjects
    FROM study_schedule.study_sessions ss
    JOIN ai_generation.flashcard_sets fs ON ss.flashcard_set_id = fs.id
    WHERE ss.user_id = p_user_id
    AND ss.accuracy_percentage < 75
    AND ss.actual_end >= NOW() - INTERVAL '14 days';
    
    -- Build recommendations
    v_recommendations := jsonb_build_object(
        'focus_areas', COALESCE(v_weak_subjects, ARRAY[]::TEXT[]),
        'recommended_session_length', 
            CASE 
                WHEN v_avg_accuracy > 85 THEN 45
                WHEN v_avg_accuracy > 70 THEN 30
                ELSE 20
            END,
        'difficulty_adjustment',
            CASE 
                WHEN v_avg_accuracy > 90 THEN 'increase'
                WHEN v_avg_accuracy < 60 THEN 'decrease'
                ELSE 'maintain'
            END,
        'streak_status', COALESCE(v_study_streak, 0),
        'motivation_message',
            CASE 
                WHEN v_study_streak >= 7 THEN 'Amazing streak! Keep up the excellent work!'
                WHEN v_study_streak >= 3 THEN 'Great consistency! You''re building a strong habit.'
                ELSE 'Start building your study streak today!'
            END
    );
    
    RETURN v_recommendations;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO study_schedule.study_plans (user_id, title, description, start_date, goal_type, target_hours_per_week) VALUES
('user_123', 'Biology Exam Preparation', 'Comprehensive review for upcoming biology exam', CURRENT_DATE, 'exam_prep', 15),
('user_123', 'Mathematics Skill Building', 'Improve calculus and algebra skills', CURRENT_DATE, 'skill_building', 10);

-- Insert sample study sessions
INSERT INTO study_schedule.study_sessions (user_id, title, session_type, scheduled_start, scheduled_duration_minutes, status, ai_generated, priority_score) VALUES
('user_123', 'Biology Cell Structure Review', 'flashcard_review', NOW() + INTERVAL '1 hour', 30, 'scheduled', true, 8.5),
('user_123', 'Math Derivatives Practice', 'quiz_practice', NOW() + INTERVAL '2 hours', 45, 'scheduled', true, 7.2),
('user_123', 'History Timeline Review', 'spaced_repetition', NOW() + INTERVAL '1 day', 25, 'scheduled', true, 6.8);

-- Insert sample analytics data
INSERT INTO study_schedule.study_analytics (user_id, date, total_study_time_minutes, sessions_completed, items_reviewed, items_correct, average_accuracy, streak_days) VALUES
('user_123', CURRENT_DATE - 1, 120, 3, 45, 38, 84.4, 6),
('user_123', CURRENT_DATE - 2, 90, 2, 30, 27, 90.0, 5),
('user_123', CURRENT_DATE - 3, 105, 3, 35, 29, 82.9, 4);