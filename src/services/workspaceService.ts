import { SupabaseClient } from '@supabase/supabase-js';
import { Workspace, WorkspaceMember, WorkspaceRole } from '@/supabase/supabase';

const WORKSPACE_TABLE = 'vibe_learning_gamify_quizz.workspaces';
const MEMBER_TABLE = 'vibe_learning_gamify_quizz.workspace_members';
// const SCHEMA_NAME = 'vibe_learning_gamify_quizz';

// Workspace-related functions

export const createWorkspace = async (supabase: SupabaseClient, workspaceData: Partial<Workspace>): Promise<Workspace | null> => {
  const { data, error } = await supabase
    .from(WORKSPACE_TABLE)
    .insert([workspaceData])
    .select()
    .single();

  if (error) {
    console.error('Error creating workspace:', error);
    return null;
  }
  return data;
};

export const getWorkspace = async (supabase: SupabaseClient, workspaceId: string): Promise<Workspace | null> => {
  const { data, error } = await supabase
    .from(WORKSPACE_TABLE)
    .select('*')
    .eq('id', workspaceId)
    .single();

  if (error) {
    console.error('Error fetching workspace:', error);
    return null;
  }
  return data;
};

export const getWorkspacesForUser = async (supabase: SupabaseClient, userId: string): Promise<Workspace[] | null> => {
    // We need to get the workspaces where the user is a member
    const { data: memberEntries, error: memberError } = await supabase
      .from(MEMBER_TABLE)
      .select('workspace_id')
      .eq('user_id', userId);
  
    if (memberError) {
      console.error('Error fetching user workspace memberships:', memberError);
      return null;
    }
  
    if (!memberEntries || memberEntries.length === 0) {
      return [];
    }
  
    const workspaceIds = memberEntries.map(m => m.workspace_id);
  
    const { data, error } = await supabase
      .from(WORKSPACE_TABLE)
      .select('*')
      .in('id', workspaceIds);
  
    if (error) {
      console.error('Error fetching workspaces:', error);
      return null;
    }
  
    return data;
  };

export const updateWorkspace = async (supabase: SupabaseClient, workspaceId: string, updates: Partial<Workspace>): Promise<Workspace | null> => {
  const { data, error } = await supabase
    .from(WORKSPACE_TABLE)
    .update(updates)
    .eq('id', workspaceId)
    .select()
    .single();

  if (error) {
    console.error('Error updating workspace:', error);
    return null;
  }
  return data;
};

export const deleteWorkspace = async (supabase: SupabaseClient, workspaceId: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase
      .from(WORKSPACE_TABLE)
      .delete()
      .eq('id', workspaceId);
  
    if (error) {
      console.error('Error deleting workspace:', error);
      return { error: new Error(error.message) };
    }
    return { error: null };
  };

// Workspace Member-related functions

export const addWorkspaceMember = async (supabase: SupabaseClient, memberData: Omit<WorkspaceMember, 'created_at'>): Promise<WorkspaceMember | null> => {
  const { data, error } = await supabase
    .from(MEMBER_TABLE)
    .insert([memberData])
    .select()
    .single();

  if (error) {
    console.error('Error adding workspace member:', error);
    return null;
  }
  return data;
};

export const removeWorkspaceMember = async (supabase: SupabaseClient, workspaceId: string, userId: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase
      .from(MEMBER_TABLE)
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);
  
    if (error) {
      console.error('Error removing workspace member:', error);
      return { error: new Error(error.message) };
    }
    return { error: null };
  };
  

export const getWorkspaceMembers = async (supabase: SupabaseClient, workspaceId: string): Promise<WorkspaceMember[] | null> => {
  const { data, error } = await supabase
    .from(MEMBER_TABLE)
    .select('*')
    .eq('workspace_id', workspaceId);

  if (error) {
    console.error('Error fetching workspace members:', error);
    return null;
  }
  return data;
};

export const updateWorkspaceMemberRole = async (supabase: SupabaseClient, workspaceId: string, userId: string, role: WorkspaceRole): Promise<WorkspaceMember | null> => {
  const { data, error } = await supabase
    .from(MEMBER_TABLE)
    .update({ role })
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating member role:', error);
    return null;
  }
  return data;
}; 