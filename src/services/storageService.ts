import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Uploads a file to a specified Supabase storage bucket.
 *
 * @param supabase - The Supabase client instance from `useSupabase()`.
 * @param bucketName - The name of the storage bucket (e.g., 'notes').
 * @param path - The full path for the file within the bucket (e.g., 'note_id/image.png').
 * @param file - The file object to upload.
 * @returns The path of the uploaded file.
 * @throws An error if the upload fails.
 */
export const uploadFile = async (
  supabase: SupabaseClient,
  bucketName: string,
  path: string,
  file: File
) => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true, // Overwrite file if it exists
    });

  if (error) {
    console.error("Error uploading file:", error.message);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return data.path;
};

/**
 * Retrieves the public URL for a file in a storage bucket.
 * This URL can be used to display images or link to files.
 * The URL itself is public, but access to the content is governed by RLS policies.
 *
 * @param supabase - The Supabase client instance from `useSupabase()`.
 * @param bucketName - The name of the storage bucket.
 * @param path - The path of the file within the bucket.
 * @returns The public URL of the file.
 */
export const getPublicUrl = (
  supabase: SupabaseClient,
  bucketName: string,
  path: string
) => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Deletes a file from a specified Supabase storage bucket.
 *
 * @param supabase - The Supabase client instance from `useSupabase()`.
 * @param bucketName - The name of the storage bucket.
 * @param path - The path of the file to delete.
 * @returns The deleted file data.
 * @throws An error if the deletion fails.
 */
export const deleteFile = async (
  supabase: SupabaseClient,
  bucketName: string,
  path: string
) => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .remove([path]);

  if (error) {
    console.error("Error deleting file:", error.message);
    throw new Error(`Failed to delete file: ${error.message}`);
  }

  return data;
}; 