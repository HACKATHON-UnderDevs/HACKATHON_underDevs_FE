import { useState } from 'react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { createStudySet } from '@/services/studySetService';
import { ScheduleAPIService } from '@/services/schedule-api-service';
import { StudySet, Note } from '@/supabase/supabase';
import { useAuth } from '@clerk/clerk-react';

export const useStudySchedule = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = useSupabase();
  const { userId } = useAuth();

  const createStudyScheduleForNote = async (note: Note, startDate: string, endDate: string) => {
    if (!supabase || !userId || !note.content) {
      const err = new Error('Supabase client, user, or note content not available.');
      setError(err);
      console.error(err);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Generate schedule from API
      const generatedSets = await ScheduleAPIService.generateSchedule({
        note_content: note.content as string, // Assuming note.content is stringified JSON
        note_title: note.title,
        startDate,
        endDate,
      });

      // 2. Save study sets to Supabase
      const studySetCreationPromises = generatedSets.map(set => {
        const studySetData: Partial<StudySet> = {
            ...set,
            user_id: userId,
            note_id: note.id,
        };
        return createStudySet(supabase, studySetData);
      });

      const newStudySets = await Promise.all(studySetCreationPromises);
      
      console.log('Successfully created study sets:', newStudySets);
      return newStudySets.filter(s => s !== null) as StudySet[];

    } catch (e) {
      const err = e instanceof Error ? e : new Error('An unknown error occurred during schedule creation.');
      setError(err);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { createStudyScheduleForNote, isLoading, error };
}; 