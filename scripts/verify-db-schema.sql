-- Verification queries to check database schema
-- Run these in your Supabase SQL editor to verify the schema

-- 1. Check if all required tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'listings', 'contact_requests', 'transactions', 'conversations', 'messages', 'reviews')
ORDER BY table_name;

-- 2. Check profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Check listings table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'listings'
ORDER BY ordinal_position;

-- 4. Check if transactions table exists (might be missing from migration)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'transactions';

-- 5. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Check if RLS is enabled on tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'listings', 'contact_requests', 'transactions')
ORDER BY tablename;
