-- Apply additional permissions for anon role to access ai_generation schema
-- Run this script in your Supabase SQL editor to fix the permission denied error

-- Grant basic permissions to anon role for connection testing
GRANT USAGE ON SCHEMA ai_generation TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA ai_generation TO anon;

-- Note: These permissions allow the anon role to read from ai_generation tables
-- but Row Level Security (RLS) policies will still restrict access to user's own data
-- when properly authenticated through Clerk.