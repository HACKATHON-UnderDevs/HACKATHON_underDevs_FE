import { SupabaseClient } from '@supabase/supabase-js';
import { StudySet } from '@/supabase/supabase';

const TABLE_NAME = 'study_sets';

/**
 * Fetches all study sets for a specific user.
 * RLS policy ensures a user can only fetch their own sets.
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user.
 * @returns A list of study sets for the user.
 */
export const getStudySetsForUser = async (supabase: SupabaseClient, userId: string): Promise<StudySet[] | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error(`Error fetching study sets for user ${userId}:`, error);
    return null;
  }
  return data;
};

/**
 * Fetches all study sets associated with a specific note.
 * RLS policy ensures a user can only fetch sets from notes they have access to.
 * @param supabase - The Supabase client instance.
 * @param noteId - The ID of the note.
 * @returns A list of study sets for the note.
 */
export const getStudySetsForNote = async (supabase: SupabaseClient, noteId: string): Promise<StudySet[] | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('note_id', noteId);

  if (error) {
    console.error(`Error fetching study sets for note ${noteId}:`, error);
    return null;
  }
  return data;
};

/**
 * Fetches a single study set by its ID.
 * @param supabase - The Supabase client instance.
 * @param studySetId - The ID of the study set to fetch.
 * @returns The study set object or null if not found.
 */
export const getStudySet = async (supabase: SupabaseClient, studySetId: string): Promise<StudySet | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', studySetId)
    .single();

  if (error) {
    console.error('Error fetching study set:', error);
    return null;
  }
  return data;
};

/**
 * Creates a new study set.
 * 'user_id' should be part of the initial data and match the authenticated user.
 * @param supabase - The Supabase client instance.
 * @param studySetData - The data for the new study set.
 * @returns The newly created study set.
 */
export const createStudySet = async (supabase: SupabaseClient, studySetData: Partial<StudySet>): Promise<StudySet | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([studySetData])
    .select()
    .single();

  if (error) {
    console.error('Error creating study set:', error);
    return null;
  }
  return data;
};

/**
 * Updates an existing study set.
 * @param supabase - The Supabase client instance.
 * @param studySetId - The ID of the study set to update.
 * @param updates - An object with the fields to update.
 * @returns The updated study set.
 */
export const updateStudySet = async (supabase: SupabaseClient, studySetId: string, updates: Partial<StudySet>): Promise<StudySet | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq('id', studySetId)
    .select()
    .single();

  if (error) {
    console.error('Error updating study set:', error);
    return null;
  }
  return data;
};

/**
 * Deletes a study set.
 * @param supabase - The Supabase client instance.
 * @param studySetId - The ID of the study set to delete.
 * @returns An object indicating success or failure.
 */
export const deleteStudySet = async (supabase: SupabaseClient, studySetId: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', studySetId);
  
    if (error) {
      console.error('Error deleting study set:', error);
      return { error: new Error(error.message) };
    }
    return { error: null };
}; 