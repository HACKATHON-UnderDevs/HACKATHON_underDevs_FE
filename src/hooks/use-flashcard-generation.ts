import { useState } from 'react';
import { QuizAPIService, Flashcard, GenerateFlashcardOptions } from '../services/quiz-api-service';

export interface FlashcardGenerationState {
  isGenerating: boolean;
  progress: number;
  error: string | null;
  flashcards: Flashcard[];
}

export const useFlashcardGeneration = () => {
  const [state, setState] = useState<FlashcardGenerationState>({
    isGenerating: false,
    progress: 0,
    error: null,
    flashcards: [],
  });

  const generateFlashcards = async (options: GenerateFlashcardOptions): Promise<Flashcard[] | null> => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      progress: 0,
      error: null,
      flashcards: [],
    }));

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        progress: Math.min(prev.progress + 10, 90),
      }));
    }, 200);

    try {
      // Generate flashcards using backend API
      const flashcards = await QuizAPIService.generateFlashcards(options);
      
      clearInterval(progressInterval);
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        progress: 100,
        flashcards,
      }));
      
      return flashcards;
    } catch (error) {
      clearInterval(progressInterval);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate flashcards';
      
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
      flashcards: [],
    });
  };

  return {
    ...state,
    generateFlashcards,
    resetState,
  };
};