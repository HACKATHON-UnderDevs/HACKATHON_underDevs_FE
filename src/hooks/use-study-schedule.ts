import { useState } from 'react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { createStudySet } from '@/services/studySetService';
import { ScheduleAPIService, StudySetFromApi } from '@/services/schedule-api-service';
import { StudySet, Note } from '@/supabase/supabase';
import { useAuth } from '@clerk/clerk-react';

type ScheduleApiResponse = StudySetFromApi[] | { [key: string]: StudySetFromApi[] };

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
      const scheduleResponse: ScheduleApiResponse = await ScheduleAPIService.generateSchedule({
        note_content: note.content as string, // Assuming note.content is stringified JSON
        note_title: note.title,
        startDate,
        endDate,
      });

      console.log("scheduleResponse", scheduleResponse);
      let generatedSetsData: StudySetFromApi[] | null = null;

      if (Array.isArray(scheduleResponse)) {
        generatedSetsData = scheduleResponse;
      } else if (typeof scheduleResponse === 'object' && scheduleResponse !== null) {
        const keys = Object.keys(scheduleResponse);
        const arrayKey = keys.find(key => Array.isArray(scheduleResponse[key]));
        if (arrayKey) {
            console.log(`Found nested array under key: ${arrayKey}`);
            generatedSetsData = scheduleResponse[arrayKey];
        }
      }

      if (!generatedSetsData) {
        console.error("Received non-array response from schedule API:", scheduleResponse);
        throw new Error("Failed to parse schedule data. Expected an array or an object containing an array.");
      }

      // 2. Save study sets to Supabase
      const studySetCreationPromises = generatedSetsData.map((set) => {
        const studySetData: Partial<StudySet> = {
            title: set.title,
            due_date: set.dueDate,
            priority: set.priority,
            item_count: set.count,
            estimated_time_minutes: set.estimatedTime,
            user_id: userId,
            note_id: note.id,
        };
        return createStudySet(supabase, studySetData);
      });

      const newStudySets = await Promise.all(studySetCreationPromises);
      
      console.log('Successfully created study sets:', newStudySets);
      return newStudySets.filter((s): s is StudySet => s !== null);

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