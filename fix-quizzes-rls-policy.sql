-- Fix RLS policies for public.quizzes table to allow anon access
-- This script resolves the "new row violates row-level security policy" error
-- Run this in your Supabase SQL editor

-- Drop existing restrictive policies that only allow authenticated users
DROP POLICY IF EXISTS "Users can delete their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can insert their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can view their own quizzes" ON public.quizzes;

-- Create anon access policy for Clerk authentication
CREATE POLICY "Allow anon access to quizzes" ON public.quizzes
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- Create authenticated user policies (for future Supabase auth integration)
CREATE POLICY "Users can access their own quizzes" ON public.quizzes
    FOR ALL TO authenticated USING (auth.jwt() ->> 'sub' = user_id);

-- Verify the policies are created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'quizzes' AND schemaname = 'public'
ORDER BY policyname;

-- Grant necessary permissions
GRANT ALL ON public.quizzes TO anon, authenticated;

-- Note: After running this script, your quiz generation should work without RLS errors
-- The application uses anon key with Clerk for authentication, so anon access is required