// Custom hook for AI Generation functionality

import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useAIGenerationSupabase } from '../contexts/AIGenerationSupabaseContext';
import { AIGenerationService } from '../services/ai-generation-service';
import {
  SourceMaterial,
  CreateSourceMaterialRequest,
  FlashcardSet,
  RecentFlashcardSet,
  GenerationSettings,
  GenerationProgress,
} from '../types/ai-generation';

export interface UseAIGenerationReturn {
  // State
  isGenerating: boolean;
  generationProgress: number;
  progressMessage: string;
  recentFlashcards: RecentFlashcardSet[];
  sourceMaterials: SourceMaterial[];
  
  // Loading states
  isLoadingRecent: boolean;
  isLoadingMaterials: boolean;
  isUploading: boolean;
  
  // Actions
  generateFlashcards: (sourceText: string, settings: GenerationSettings) => Promise<FlashcardSet | null>;
  saveSourceMaterial: (data: CreateSourceMaterialRequest) => Promise<SourceMaterial | null>;
  uploadSourceMaterial: (file: File, title?: string) => Promise<SourceMaterial>;
  loadRecentContent: () => Promise<void>;
  loadSourceMaterials: () => Promise<void>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export const useAIGeneration = (): UseAIGenerationReturn => {
  const { user } = useUser();
  const { supabase } = useAIGenerationSupabase();
  
  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [recentFlashcards, setRecentFlashcards] = useState<RecentFlashcardSet[]>([]);
  const [sourceMaterials, setSourceMaterials] = useState<SourceMaterial[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Service is now static, no instance needed

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Simulate AI generation progress
  const simulateProgress = useCallback((type: 'flashcards' | 'quiz') => {
    const stages: GenerationProgress[] = [
      { stage: 'analyzing', percentage: 20, message: `Analyzing source material...` },
      { stage: 'generating', percentage: 60, message: `Generating ${type}...` },
      { stage: 'formatting', percentage: 90, message: `Formatting content...` },
      { stage: 'complete', percentage: 100, message: `${type} generated successfully!` },
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        const stage = stages[currentStage];
        setGenerationProgress(stage.percentage);
        setProgressMessage(stage.message);
        currentStage++;
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return interval;
  }, []);

  // Upload source material file
  const uploadSourceMaterial = useCallback(
    async (file: File, title?: string): Promise<SourceMaterial> => {
      if (!supabase || !user?.id) {
        throw new Error('Service not initialized or user not authenticated');
      }

      setIsUploading(true);
      setError(null);

      try {
        const material = await AIGenerationService.createSourceMaterial(
         supabase,
         user.id,
         title || file.name,
         await file.text(),
         file.type.includes('text') ? 'text' : 'document'
       );

        // Refresh source materials
        await loadSourceMaterials();

        return material;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [supabase, user?.id]
  );

  // Save source material to database
  const saveSourceMaterial = useCallback(async (
    data: CreateSourceMaterialRequest
  ): Promise<SourceMaterial | null> => {
    if (!supabase || !user?.id) {
      setError('Service not available or user not authenticated');
      return null;
    }

    try {
       const sourceMaterial = await AIGenerationService.createSourceMaterial(
         supabase,
         user.id,
         data.title,
         data.content,
         data.type || 'text'
       );
      
      if (sourceMaterial) {
        setSourceMaterials(prev => [sourceMaterial, ...prev]);
      }

      return sourceMaterial;
    } catch (err) {
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, [supabase, user?.id]);

  // Generate flashcards
  const generateFlashcards = useCallback(async (
    sourceText: string,
    settings: GenerationSettings
  ): Promise<FlashcardSet | null> => {
    if (!supabase || !user?.id) {
      setError('Service not available or user not authenticated');
      return null;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);
    
    try {
      // Start progress simulation
      const progressInterval = simulateProgress('flashcards');

      // First, save the source material
      const sourceMaterial = await saveSourceMaterial({
        title: `Flashcard Source - ${new Date().toLocaleDateString()}`,
        content: sourceText,
        content_type: 'text',
        subject: 'General',
      });

      if (!sourceMaterial) {
        clearInterval(progressInterval);
        setIsGenerating(false);
        return null;
      }

      // Create flashcard set
      const flashcardSet = await AIGenerationService.createFlashcardSet(
        supabase,
        user.id,
        sourceMaterial.id,
        `Flashcards - ${sourceMaterial.title}`,
        `Generated flashcards from ${sourceMaterial.title}`,
        settings.subject,
        settings.difficulty,
        settings.count,
        settings.tags
      );

      if (!flashcardSet) {
        clearInterval(progressInterval);
        setError(`Failed to create flashcard set`);
        setIsGenerating(false);
        return null;
      }

      // Generate flashcards using backend API
      try {
        // Import the new quiz API service
        const { QuizAPIService } = await import('../services/quiz-api-service');
        
        // Generate flashcards with backend API
        const generatedFlashcards = await QuizAPIService.generateFlashcards({
          sourceText: sourceText,
          count: settings.count,
          difficulty: settings.difficulty,
          subject: settings.subject
        });
        
        // Create AI generation service instance
        const aiService = new AIGenerationService(supabase);
        
        // Save flashcards to database
        const { error: cardsError } = await aiService.createFlashcards(
          flashcardSet.id,
          generatedFlashcards
        );
        
        if (cardsError) {
          clearInterval(progressInterval);
          setError(`Failed to save flashcards: ${cardsError.message}`);
          setIsGenerating(false);
          return null;
        }
        
        // Update flashcard set with the actual card count
        await supabase
          .schema('ai_generation')
          .from('flashcard_sets')
          .update({ card_count: generatedFlashcards.length })
          .eq('id', flashcardSet.id);
          
      } catch (cardsError) {
        clearInterval(progressInterval);
        setError(`Failed to generate flashcards: ${cardsError instanceof Error ? cardsError.message : 'Unknown error'}`);
        setIsGenerating(false);
        return null;
      }

      // Wait for progress to complete
      await new Promise(resolve => setTimeout(resolve, 4000));
      clearInterval(progressInterval);
      
      // Refresh recent content
      await loadRecentContent();
      
      setIsGenerating(false);
      return flashcardSet;

    } catch (err) {
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsGenerating(false);
      return null;
    }
  }, [supabase, user?.id]);

  // Quiz generation has been moved to QuizAPIService and useQuizGeneration hook
  // See QuizGenerator component for quiz functionality

  // Load recent content
  const loadRecentContent = useCallback(async () => {
    if (!user?.id || !supabase) return;

    setIsLoadingRecent(true);
    try {
      const flashcardSets = await AIGenerationService.getFlashcardSets(supabase, user.id);

      const recentFlashcards: RecentFlashcardSet[] = flashcardSets.slice(0, 5).map(set => ({
        id: set.id,
        title: set.title,
        subject: set.subject || 'General',
        count: set.card_count || 0,
        accuracy: 85, // Mock data - would come from study sessions
        created_at: set.created_at,
      }));
      setRecentFlashcards(recentFlashcards);
    } catch (err) {
      console.error('Failed to load recent content:', err);
      setError('Failed to load recent content');
    } finally {
      setIsLoadingRecent(false);
    }
  }, [user?.id, supabase]);

  // Load source materials
  const loadSourceMaterials = useCallback(async () => {
    if (!supabase || !user?.id) return;

    setIsLoadingMaterials(true);
    try {
      const materials = await AIGenerationService.getSourceMaterials(supabase, user.id);
      setSourceMaterials(materials);
    } catch (err) {
      console.error('Failed to load source materials:', err);
    } finally {
      setIsLoadingMaterials(false);
    }
  }, [supabase, user?.id]);

  // Load recent content on mount
  useEffect(() => {
    if (user?.id && supabase) {
      loadRecentContent();
    }
  }, [user?.id, supabase]);

  // Load initial data
  useEffect(() => {
    if (supabase && user?.id) {
      loadSourceMaterials();
      loadRecentContent();
    }
  }, [supabase, user?.id]);

  return {
    // State
    isGenerating,
    generationProgress,
    progressMessage,
    recentFlashcards,
    sourceMaterials,
    isLoadingRecent,
    isLoadingMaterials,
    isUploading,
    
    // Actions
    generateFlashcards,
    saveSourceMaterial,
    uploadSourceMaterial,
    loadRecentContent,
    loadSourceMaterials,
    
    // Error handling
    error,
    clearError,
  };
};