// src/types/gamify.ts
// src/types/gamify.ts
// Represents a single question's answer option
export interface AnswerOption {
    id: string;
    text: string;
}

// Represents a single question in a quiz
export interface QuizQuestion {
  id: string;
  questionText: string;
  options: AnswerOption[];
  correctOptionId: string;
  explanation?: string | null;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
}

// Represents a multiplayer game session
export interface GameSession {
  id: string;
  host_user_id: string;
  session_code: string;
  status: 'waiting' | 'in_progress' | 'completed'; 
  created_at: string;
  started_at?: string;
  ended_at?: string;
  max_participants: number;
  current_question_index: number;
  quiz_id: string;
  quizzes?: {
    id: string;
    title: string;
  }
}

// Represents a player within a game session
export interface GameParticipant {
  id: number;
  session_id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  score: number;
  joined_at: string;
  is_host: boolean;
  is_ready: boolean;
  final_rank?: number;
  streak?: number;
}

// Represents the real-time state of a game
export interface GameState {
  session: GameSession | null;
  participants: GameParticipant[];
  currentQuestion: (QuizQuestion & { correctOptionIndex: number }) | null;
  questionNumber: number;
  totalQuestions: number;
  timer: number;
  phase: 'loading' | 'get_ready' | 'question' | 'answer_reveal' | 'leaderboard' | 'finished';
  lastCorrectAnswer?: boolean;
  selectedAnswerIndex?: number;
}

// Represents an achievement definition
export interface Achievement {
  achievement_id: number;
  name: string;
  description: string;
  criteria: Record<string, any>; // JSONB field
  badge_icon: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

// Represents an achievement earned by a user
export interface UserAchievement {
  id: number;
  user_id: string;
  achievement_id: number;
  earned_at: string;
  progress: Record<string, any> | null; // JSONB field for progress tracking
}

// Represents user's overall stats
export interface UserStats {
  user_id: string;
  total_points: number;
  streak_count: number;
  last_active_date: string | null;
  badges_earned: UserAchievement[];
}

// Types for Supabase Realtime event payloads
export type RealtimeEvent =
  | { type: 'question_start'; payload: { question: QuizQuestion; timer_duration: number } }
  | { type: 'answer_submit'; payload: { user_id: string; answer_index: number; time_taken: number } }
  | { type: 'score_update'; payload: { participants: GameParticipant[] } }
  | { type: 'game_end'; payload: { final_scores: GameParticipant[] } }
  | { type: 'player_joined'; payload: { participant: GameParticipant } }
  | { type: 'player_left'; payload: { user_id: string } }
  | { type: 'player_ready'; payload: { user_id: string; is_ready: boolean } };

// Type for scoring calculation parameters
export interface ScoreCalculationParams {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  time_remaining: number;
  total_time: number;
  streak_count: number;
  is_correct: boolean;
}