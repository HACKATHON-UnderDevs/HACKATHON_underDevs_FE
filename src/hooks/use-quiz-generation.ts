import { useState } from 'react';
import { QuizAPIService, QuizQuestion, GenerateQuizOptions } from '../services/quiz-api-service';

export interface QuizGenerationState {
  isGenerating: boolean;
  progress: number;
  error: string | null;
  questions: QuizQuestion[];
}

export const useQuizGeneration = () => {
  const [state, setState] = useState<QuizGenerationState>({
    isGenerating: false,
    progress: 0,
    error: null,
    questions: [],
  });

  const generateQuiz = async (options: GenerateQuizOptions): Promise<QuizQuestion[] | null> => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      progress: 0,
      error: null,
      questions: [],
    }));

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        progress: Math.min(prev.progress + 10, 90),
      }));
    }, 200);

    try {
      // Generate quiz using backend API
      const questions = await QuizAPIService.generateQuiz(options);
      
      clearInterval(progressInterval);
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        progress: 100,
        questions,
      }));
      
      return questions;
    } catch (error) {
      clearInterval(progressInterval);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate quiz';
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        progress: 0,
        error: errorMessage,
      }));
      
      return null;
    }
  };

  const resetState = () => {
    setState({
      isGenerating: false,
      progress: 0,
      error: null,
      questions: [],
    });
  };

  return {
    ...state,
    generateQuiz,
    resetState,
  };
};