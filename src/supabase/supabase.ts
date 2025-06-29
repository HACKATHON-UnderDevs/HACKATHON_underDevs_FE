export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string; // Clerk User ID
  supabase_auth_user_id?: string; // UUID
  username?: string;
  email?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'premium' | 'corporate';
  subscription_status?: string;
  clerk_subscription_id?: string;
  storage_quota_bytes: number;
  current_theme_id?: string; // UUID
  interface_layout: string;
  xp_points: number;
  user_level: number;
  current_journal_streak: number;
  longest_journal_streak: number;
  preferences?: Json; // JSONB
  ai_insights?: Json; // JSONB
  ai_insights_generated_at?: string; // TIMESTAMPTZ
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export type WorkspaceRole = 'admin' | 'member';

export interface Workspace {
  id: string; // UUID
  owner_id: string; // Corresponds to public.profiles(id)
  name: string;
  description?: string;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface WorkspaceMember {
  workspace_id: string; // UUID
  user_id: string; // Corresponds to public.profiles(id)
  role: WorkspaceRole;
  created_at: string; // TIMESTAMPTZ
}

// Based on LectureNote and the new workspace integration
export interface Note {
    id: string; //uuid
    owner_id: string; // Corresponds to public.profiles(id)
    title: string;
    content: string; // JSON from BlockNote
    file_path: string;
    metadata: Json; // JSONB
    created_at: string; // TIMESTAMPTZ
    updated_at: string; // TIMESTAMPTZ
    workspace_id?: string | null; // UUID, nullable
  }

export type StudyPriority = 'low' | 'medium' | 'high';

export interface StudySet {
  id: string; // UUID
  title: string;
  part?: string | null;
  user_id: string; // Corresponds to public.profiles(id)
  note_id: string; // Corresponds to public.notes(id)
  due_date?: string | null; // DATE
  priority: StudyPriority;
  item_count: number;
  estimated_time_minutes?: number | null;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}
