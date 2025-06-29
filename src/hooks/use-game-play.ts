// src/hooks/use-game-play.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/use-game-play.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useGamifySupabase } from '@/contexts/GamifySupabaseContext';
import { useUser } from '@clerk/clerk-react';
import type { GameState, QuizQuestion, GameParticipant, GameSession } from '@/types/gamify';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

const GET_READY_DURATION = 5;
const QUESTION_DURATION = 20;
const REVEAL_DURATION = 7;
const LEADERBOARD_DURATION = 8;

const gameService = {
  async getFullGameData(supabase: any, sessionId: string) {
    const { data: sessionData, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*, quizzes:generated_quizzes(id, title), game_participants(*, profiles(username, avatar_url))')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;
    if (!sessionData.quizzes?.id) {
        console.warn("Could not fetch quiz details directly, likely due to RLS. Waiting for host broadcast.");
        const { quizzes, game_participants, ...restOfSession } = sessionData;
        const formattedParticipants = (game_participants || []).map((p: any) => ({
             id: p.id, session_id: p.session_id, user_id: p.user_id, score: p.score ?? 0,
             joined_at: p.joined_at, is_host: p.is_host ?? false, is_ready: p.is_ready ?? false,
             username: p.profiles?.username ?? 'Player', avatar_url: p.profiles?.avatar_url, streak: 0,
        }));
        return { session: { ...restOfSession, quizzes: { id: sessionData.quiz_id, title: 'Loading...' } }, participants: formattedParticipants, questions: [] };
    }

    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('*, answer_options(*)')
      .eq('quiz_id', sessionData.quizzes.id)
      .order('created_at', { ascending: true });
    
    if (questionsError) {
        console.warn("Could not fetch questions, likely due to RLS policies. Waiting for broadcast from host.");
    }
    
    const formattedQuestions: QuizQuestion[] = (questionsData || []).map((q: any) => ({
      id: q.id,
      questionText: q.question_text,
      options: q.answer_options.map((opt: any) => ({ id: opt.id, text: opt.option_text })),
      correctOptionId: q.answer_options.find((opt: any) => opt.is_correct)?.id ?? '',
      difficulty: q.metadata?.difficulty || 'Medium',
      topic: q.metadata?.topic || 'General',
      explanation: q.metadata?.explanation || null,
    }));

    const { quizzes, game_participants, ...restOfSession } = sessionData;
    const formattedSession = { ...restOfSession, quizzes };

    const formattedParticipants: GameParticipant[] = game_participants.map((p: any) => ({
        id: p.id,
        session_id: p.session_id,
        user_id: p.user_id,
        score: p.score ?? 0,
        joined_at: p.joined_at,
        is_host: p.is_host ?? false,
        is_ready: p.is_ready ?? false,
        final_rank: p.final_rank,
        username: p.profiles?.username ?? 'Player',
        avatar_url: p.profiles?.avatar_url,
        streak: 0,
    }));
    
    return { session: formattedSession, participants: formattedParticipants, questions: formattedQuestions };
  },
  async submitAnswer(supabase: any, payload: { 
    sessionId: string; 
    questionId: string; 
    optionId: string; 
    responseTime: number; 
    userId: string;
  }) {
    const { error } = await supabase.from('game_answer_submissions').insert({
      session_id: payload.sessionId,
      question_id: payload.questionId,
      selected_option_id: payload.optionId,
      response_time_ms: payload.responseTime,
      user_id: payload.userId,
    });
    if (error) throw error;
  },
  async advanceQuestion(supabase: any, sessionId: string, nextIndex: number) {
      return supabase.from('game_sessions').update({ current_question_index: nextIndex }).eq('id', sessionId);
  },
  async finishGame(supabase: any, sessionId: string) {
      return supabase.from('game_sessions').update({ status: 'completed', ended_at: new Date().toISOString() }).eq('id', sessionId);
  }
};


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
  });
  const [isHost, setIsHost] = useState(false);
  
  const isInitializedRef = useRef(false);
  const allQuestionsRef = useRef<QuizQuestion[]>([]);

  const questionStartTimeRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const prepareQuestion = useCallback((q: QuizQuestion | undefined) => {
    if (!q) return null;
    const correctOptionIndex = q.options.findIndex(opt => opt.id === q.correctOptionId);
    return { ...q, correctOptionIndex };
  }, []);
  
  // This useEffect is ONLY for the host to act as the game engine.
  useEffect(() => {
      if (!isHost || !isInitializedRef.current) return;
  
      const gameLoop = () => {
          setGameState(prev => {
              if (prev.phase === 'loading' || prev.phase === 'finished') {
                  if (timerRef.current) clearInterval(timerRef.current);
                  return prev;
              }
  
              let newTime = prev.timer > 0 ? prev.timer - 1 : 0;
              let newPhase: GameState['phase'] = prev.phase;
  
              if (newTime === 0) {
                  const currentQuestionIndex = prev.session?.current_question_index ?? 0;
                  const currentQuestionId = allQuestionsRef.current[currentQuestionIndex]?.id;

                  switch (prev.phase) {
                      case 'get_ready':
                          newPhase = 'question';
                          newTime = QUESTION_DURATION;
                          questionStartTimeRef.current = Date.now();
                          break;
                      case 'question':
                          newPhase = 'answer_reveal';
                          newTime = REVEAL_DURATION;
                          if (currentQuestionId) {
                            supabase?.functions.invoke('process-answers', {
                                body: { sessionId, questionId: currentQuestionId },
                            });
                          }
                          break;
                      case 'answer_reveal':
                          if (currentQuestionIndex >= allQuestionsRef.current.length - 1) {
                              newPhase = 'finished';
                              gameService.finishGame(supabase, sessionId);
                          } else {
                              newPhase = 'leaderboard';
                              newTime = LEADERBOARD_DURATION;
                          }
                          break;
                      case 'leaderboard':
                          gameService.advanceQuestion(supabase, sessionId, currentQuestionIndex + 1);
                          newPhase = 'loading'; 
                          newTime = 0;
                          break;
                  }
              }
  
              const newState = { ...prev, phase: newPhase, timer: newTime };
              
              channelRef.current?.send({
                  type: 'broadcast',
                  event: 'game_state_update',
                  payload: { phase: newState.phase, timer: newState.timer },
              });
  
              return newState;
          });
      };
  
      const timerId = setInterval(gameLoop, 1000);
      timerRef.current = timerId;
  
      return () => clearInterval(timerId);
  }, [isHost, supabase, sessionId, gameState.phase]);


  // This is the main setup useEffect for ALL players
  useEffect(() => {
    if (!supabase || !user) return;

    if (!channelRef.current) {
        const channel = supabase.channel(`game-session-${sessionId}`, {
            config: { broadcast: { self: true } }
        });

        // ALL players listen for state updates from the host
        channel.on('broadcast', { event: 'game_state_update' }, ({ payload }) => {
            setGameState(prev => {
                const updatedState = { ...prev, phase: payload.phase as GameState['phase'], timer: payload.timer };
                if (payload.phase === 'question' && prev.phase !== 'question') {
                    questionStartTimeRef.current = Date.now();
                }
                return updatedState;
            });
        });

        channel.on('broadcast', { event: 'all_questions' }, ({ payload }) => {
            if (payload && payload.questions && allQuestionsRef.current.length === 0) {
                const questions = payload.questions as QuizQuestion[];
                allQuestionsRef.current = questions;
                
                setGameState(prev => {
                    if (prev.session) {
                        isInitializedRef.current = true;
                        const newState = {
                            ...prev,
                            totalQuestions: questions.length,
                            phase: 'get_ready' as GameState['phase'],
                            timer: GET_READY_DURATION,
                            questionNumber: prev.session.current_question_index + 1,
                            currentQuestion: prepareQuestion(questions[prev.session.current_question_index]),
                            selectedAnswerIndex: undefined,
                        };
                        return newState;
                    }
                    return prev;
                });
            }
        });
        
        channel.on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'game_sessions',
            filter: `id=eq.${sessionId}`,
        }, (payload) => {
            const updatedSession = payload.new as GameSession;
            setGameState(prev => {
                if (updatedSession.current_question_index !== prev.session?.current_question_index) {
                   return {
                        ...prev,
                        session: updatedSession,
                        phase: 'get_ready',
                        timer: GET_READY_DURATION,
                        questionNumber: updatedSession.current_question_index + 1,
                        currentQuestion: prepareQuestion(allQuestionsRef.current[updatedSession.current_question_index]),
                        selectedAnswerIndex: undefined,
                    };
                }
                if (updatedSession.status === 'completed' && prev.phase !== 'finished') {
                    return {...prev, session: updatedSession, phase: 'finished', timer: 0};
                }
                return {...prev, session: updatedSession};
            });
        });

        channel.on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'game_participants',
            filter: `session_id=eq.${sessionId}`
        }, (payload) => {
             const updatedParticipant = payload.new as GameParticipant;
             setGameState(prev => ({
                ...prev,
                participants: prev.participants.map(p => 
                    p.user_id === updatedParticipant.user_id 
                    ? { ...p, score: updatedParticipant.score } 
                    : p
                )
             }));
        });
        
        channel.subscribe((_status, err) => {
            if(err) toast.error(`Realtime Error: ${err.message}`);
        });
        channelRef.current = channel;
    }

    gameService.getFullGameData(supabase, sessionId).then(data => {
        const iAmHost = data.session.host_user_id === user.id;
        setIsHost(iAmHost);
        setGameState(prev => ({...prev, session: data.session, participants: data.participants}));
        
        if (iAmHost) {
            if (data.questions.length === 0) {
                toast.error("Error: This quiz has no questions and cannot be played.");
                setGameState(prev => ({ ...prev, phase: 'finished' }));
                return;
            }
            allQuestionsRef.current = data.questions;
            setGameState(prev => ({
                ...prev,
                totalQuestions: data.questions.length,
                phase: 'get_ready',
                timer: GET_READY_DURATION,
                questionNumber: data.session.current_question_index + 1,
                currentQuestion: prepareQuestion(data.questions[data.session.current_question_index]),
                selectedAnswerIndex: undefined,
            }));
            isInitializedRef.current = true;
            
            channelRef.current?.send({
                type: 'broadcast',
                event: 'all_questions',
                payload: { questions: data.questions },
            });
        }
    }).catch(error => {
        toast.error("Error setting up game: " + error.message);
        setGameState(prev => ({ ...prev, phase: 'finished' }));
    });

    return () => {
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
        }
    }
  }, [sessionId, supabase, user, prepareQuestion]);
  
  const selectAnswer = useCallback(async (answerIndex: number) => {
    if (gameState.phase !== 'question' || gameState.selectedAnswerIndex !== undefined || !gameState.currentQuestion || !supabase || !user) return;
    
    const responseTime = Date.now() - questionStartTimeRef.current;
    const selectedOption = gameState.currentQuestion.options[answerIndex];

    setGameState(prev => ({ ...prev, selectedAnswerIndex: answerIndex }));

    try {
      await gameService.submitAnswer(supabase, {
        sessionId,
        questionId: gameState.currentQuestion.id,
        optionId: selectedOption.id,
        responseTime,
        userId: user.id,
      });
      toast.success("Answer submitted!");
    } catch (error) {
        toast.error("Failed to submit answer: " + (error as Error).message);
    }
  }, [gameState, supabase, sessionId, user]);

  return { gameState, selectAnswer };
}