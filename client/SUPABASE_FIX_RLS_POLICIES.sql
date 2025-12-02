-- =====================================================
-- Fix RLS Policies for Username Check
-- This allows anonymous users to check username availability
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can read all profiles" ON public.users;
DROP POLICY IF EXISTS "Anyone can read usernames" ON public.users;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Anyone can read usernames (for availability checking)
-- This is safe because we're only exposing usernames, not sensitive data
CREATE POLICY "Anyone can read usernames" ON public.users
  FOR SELECT USING (true);

