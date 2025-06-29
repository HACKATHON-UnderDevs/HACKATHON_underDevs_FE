import { SupabaseClient } from '@supabase/supabase-js';
import { Note } from '@/supabase/supabase';
import { getWorkspacesForUser } from './workspaceService';

const TABLE_NAME = 'notes';

/**
 * Fetches all notes accessible to the current user.
 * This includes their own notes and notes in workspaces they are a member of.
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the authenticated user.
 * @returns A list of notes.
 */
export const getNotes = async (supabase: SupabaseClient, userId: string): Promise<Note[] | null> => {
    const userWorkspaces = await getWorkspacesForUser(supabase, userId);
    const workspaceIds = userWorkspaces ? userWorkspaces.map((ws) => ws.id) : [];
  
    const ownerFilter = `owner_id.eq.${userId}`;
    let filter;
  
    if (workspaceIds.length > 0) {
      const workspaceFilter = `workspace_id.in.(${workspaceIds.join(',')})`;
      filter = `${ownerFilter},${workspaceFilter}`;
    } else {
      filter = ownerFilter;
    }
  
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .or(filter);
  
    if (error) {
      console.error('Error fetching notes:', error);
      return null;
    }
    return data;
  };

/**
 * Fetches all notes within a specific workspace.
 * Assumes RLS is set up to only allow access if the user is a member of the workspace.
 * @param supabase - The Supabase client instance.
 * @param workspaceId - The ID of the workspace.
 * @returns A list of notes from the workspace.
 */
export const getNotesInWorkspace = async (supabase: SupabaseClient, workspaceId: string): Promise<Note[] | null> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('workspace_id', workspaceId);
  
    if (error) {
      console.error(`Error fetching notes for workspace ${workspaceId}:`, error);
      return null;
    }
    return data;
  };

/**
 * Fetches a single note by its ID.
 * @param supabase - The Supabase client instance.
 * @param noteId - The ID of the note to fetch.
 * @returns The note object or null if not found.
 */
export const getNote = async (supabase: SupabaseClient, noteId: string): Promise<Note | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', noteId)
    .single();

  if (error) {
    console.error('Error fetching note:', error);
    return null;
  }
  return data;
};

/**
 * Creates a new note.
 * @param supabase - The Supabase client instance.
 * @param noteData - The data for the new note.
 * @returns The newly created note.
 */
export const createNote = async (supabase: SupabaseClient, noteData: Partial<Note>): Promise<Note | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([noteData])
    .select()
    .single();

  if (error) {
    console.error('Error creating note:', error);
    return null;
  }
  return data;
};

/**
 * Updates an existing note.
 * @param supabase - The Supabase client instance.
 * @param noteId - The ID of the note to update.
 * @param updates - An object with the fields to update.
 * @returns The updated note.
 */
export const updateNote = async (supabase: SupabaseClient, noteId: string, updates: Partial<Note>): Promise<Note | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq('id', noteId)
    .select()
    .single();

  if (error) {
    console.error('Error updating note:', error);
    return null;
  }
  return data;
};

/**
 * Deletes a note.
 * @param supabase - The Supabase client instance.
 * @param noteId - The ID of the note to delete.
 * @returns An object indicating success or failure.
 */
export const deleteNote = async (supabase: SupabaseClient, noteId: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', noteId);
  
    if (error) {
      console.error('Error deleting note:', error);
      return { error: new Error(error.message) };
    }
    return { error: null };
  }; 