import { SupabaseClient } from '@supabase/supabase-js';
import { Profile } from '@/supabase/supabase';

const TABLE_NAME = 'profiles';

/**
 * Fetches a user profile by their Clerk ID.
 * @param supabase - The Supabase client instance.
 * @param id - The Clerk user ID of the profile to fetch.
 * @returns The user profile, or null if not found.
 */
export const getProfile = async (supabase: SupabaseClient, id: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

/**
 * Fetches a user profile by their email address.
 * @param supabase - The Supabase client instance.
 * @param email - The email of the profile to fetch.
 * @returns The user profile, or null if not found.
 */
export const getProfileByEmail = async (supabase: SupabaseClient, email: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    // Don't log an error if the user is simply not found
    if (error.code !== 'PGRST116') { // PGRST116 = "No rows found"
      console.error('Error fetching profile by email:', error);
    }
    return null;
  }

  return data;
};

/**
 * Creates a new user profile. This is typically called after a new user signs up via Clerk.
 * @param supabase - The Supabase client instance.
 * @param profileData - The initial profile data.
 * @returns The newly created profile.
 */
export const createProfile = async (supabase: SupabaseClient, profileData: Partial<Profile>): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([profileData])
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  return data;
};

/**
 * Updates an existing user profile.
 * @param supabase - The Supabase client instance.
 * @param id - The Clerk user ID of the profile to update.
 * @param updates - An object with the fields to update.
 * @returns The updated profile.
 */
export const updateProfile = async (supabase: SupabaseClient, id: string, updates: Partial<Profile>): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data;
}; 