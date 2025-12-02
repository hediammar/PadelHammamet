-- Migration script for adding username and phone fields to users table
-- Run this in your Supabase SQL Editor

-- Update users table to include username and phone fields
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS phone_prefix TEXT DEFAULT '+216',
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- New policies
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Allow inserting user profiles
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Note: After running this migration, go to Supabase Dashboard:
-- Authentication -> Settings -> Auth Providers -> Email
-- Toggle OFF "Enable email confirmations" to allow immediate sign-in after signup

