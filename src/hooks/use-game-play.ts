// src/hooks/use-game-play.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useGamifySupabase } from '@/contexts/GamifySupabaseContext';
import { useUser } from '@clerk/clerk-react';
import type { GameState, QuizQuestion, GameParticipant } from '@/types/gamify';

// MOCK DATA FOR SIMULATION
const MOCK_QUESTIONS: QuizQuestion[] = [
  { id: 'q1', questionText: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondrion", "Golgi apparatus"], correctOptionIndex: 2, difficulty: 'Easy', topic: 'Biology', explanation: 'Mitochondria are responsible for generating most of the cell\'s supply of adenosine triphosphate (ATP), used as a source of chemical energy.' },
  { id: 'q2', questionText: "What is the value of 'pi' to two decimal places?", options: ["3.12", "3.14", "3.16", "3.18"], correctOptionIndex: 1, difficulty: 'Easy', topic: 'Math' },
  { id: 'q3', questionText: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], correctOptionIndex: 1, difficulty: 'Easy', topic: 'Astronomy', explanation: 'Mars is often referred to as the "Red Planet" because the iron oxide prevalent on its surface gives it a reddish appearance.' },
  { id: 'q4', questionText: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correctOptionIndex: 1, difficulty: 'Medium', topic: 'Literature' },
];

const MOCK_PARTICIPANTS: GameParticipant[] = [
    { id: 1, session_id: '1', user_id: 'user_1', username: 'PlayerOne', avatar_url: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', score: 0, joined_at: '', is_host: true, is_ready: true, streak: 0 },
    { id: 2, session_id: '1', user_id: 'user_2', username: 'PlayerTwo', avatar_url: 'https://i.pravatar.cc/150?u=a042581f4e29026705d', score: 0, joined_at: '', is_host: false, is_ready: true, streak: 0 },
    { id: 3, session_id: '1', user_id: 'user_3', username: 'PlayerThree', avatar_url: 'https://i.pravatar.cc/150?u=a042581f4e29026706d', score: 0, joined_at: '', is_host: false, is_ready: true, streak: 0 },
];

const GET_READY_DURATION = 5;
const QUESTION_DURATION = 10;
const REVEAL_DURATION = 5;
const LEADERBOARD_DURATION = 5;

export function useGamePlay(sessionId: string) {
  const supabase = useGamifySupabase();
  const { user } = useUser();
  const [gameState, setGameState] = useState<GameState>({
    session: null,
    participants: [],
    currentQuestion: null,
    questionNumber: 0,
    totalQuestions: 0,
    timer: 0,
    phase: 'loading',
    selectedAnswerIndex: undefined,
  });

  const questionIndexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const advancePhase = useCallback(() => {
    setGameState(prev => {
        switch(prev.phase) {
            case 'get_ready':
                return { ...prev, phase: 'question', timer: QUESTION_DURATION, selectedAnswerIndex: undefined };
            case 'question':
                return { ...prev, phase: 'answer_reveal', timer: REVEAL_DURATION };
            case 'answer_reveal':
                if (questionIndexRef.current >= MOCK_QUESTIONS.length - 1) {
                    return { ...prev, phase: 'finished', timer: 0 };
                }
                return { ...prev, phase: 'leaderboard', timer: LEADERBOARD_DURATION };
            case 'leaderboard':
                questionIndexRef.current++;
                return { ...prev, phase: 'question', timer: QUESTION_DURATION, selectedAnswerIndex: undefined, questionNumber: prev.questionNumber + 1, currentQuestion: MOCK_QUESTIONS[questionIndexRef.current] };
            default:
                return prev;
        }
    });
  }, []);

  useEffect(() => {
    // Initial setup simulation
    const localUser = MOCK_PARTICIPANTS.find(p => p.user_id === 'user_1') || MOCK_PARTICIPANTS[0];
    if (user && !MOCK_PARTICIPANTS.find(p => p.user_id === user.id)) {
      MOCK_PARTICIPANTS[0] = { ...localUser, user_id: user.id, username: user.fullName || 'You' };
    }
    
    setGameState({
        session: { id: sessionId, host_user_id: 'user_1' } as any,
        participants: MOCK_PARTICIPANTS,
        totalQuestions: MOCK_QUESTIONS.length,
        phase: 'get_ready',
        timer: GET_READY_DURATION,
        questionNumber: 1,
        currentQuestion: MOCK_QUESTIONS[0],
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [sessionId, user]);

  useEffect(() => {
    if (gameState.phase === 'loading' || gameState.phase === 'finished') {
        if(timerRef.current) clearInterval(timerRef.current);
        return;
    }
    
    timerRef.current = setInterval(() => {
        setGameState(prev => {
            if (prev.timer > 1) {
                return { ...prev, timer: prev.timer - 1 };
            }
            advancePhase();
            return prev; // temp, advancePhase will set new state
        });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState.phase, advancePhase]);
  
  const selectAnswer = useCallback((answerIndex: number) => {
    if (gameState.phase !== 'question' || gameState.selectedAnswerIndex !== undefined) return;
    
    setGameState(prev => {
        const isCorrect = answerIndex === prev.currentQuestion?.correctOptionIndex;
        const points = isCorrect ? 100 + (prev.timer * 10) : 0;
        
        const updatedParticipants = prev.participants.map(p => {
          if (p.user_id === user?.id) {
            return {
              ...p,
              score: p.score + points,
              streak: isCorrect ? (p.streak ?? 0) + 1 : 0
            };
          }
          return p;
        });
        
        return {
            ...prev,
            selectedAnswerIndex: answerIndex,
            lastCorrectAnswer: isCorrect,
            participants: updatedParticipants
        };
    });
  }, [gameState.phase, gameState.selectedAnswerIndex, user?.id]);

  return { gameState, selectAnswer };
}