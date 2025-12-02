-- =====================================================
-- Complete Supabase Database Setup for Padel Hammamet
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. USERS TABLE
-- Stores user profiles (extends Supabase auth.users)
-- =====================================================

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_prefix TEXT DEFAULT '+216',
  phone_number TEXT,
  name TEXT,
  picture TEXT,
  provider TEXT DEFAULT 'email', -- 'email', 'google', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON public.users(provider);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read all profiles" ON public.users;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can read all profiles (for displaying user info)
CREATE POLICY "Users can read all profiles" ON public.users
  FOR SELECT USING (true);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. GUEST USERS TABLE
-- Stores guest user information for bookings
-- =====================================================

-- Create guest_users table
CREATE TABLE IF NOT EXISTS public.guest_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_guest_users_email ON public.guest_users(email);

-- Enable Row Level Security
ALTER TABLE public.guest_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert guest users" ON public.guest_users;
DROP POLICY IF EXISTS "Users can read guest users" ON public.guest_users;

-- Policy: Anyone can insert guest users
CREATE POLICY "Anyone can insert guest users" ON public.guest_users
  FOR INSERT WITH CHECK (true);

-- Policy: Users can read guest users (for their own bookings)
CREATE POLICY "Users can read guest users" ON public.guest_users
  FOR SELECT USING (true);

-- =====================================================
-- 3. RESERVATIONS TABLE
-- Stores court reservations/bookings
-- =====================================================

-- Create reservations table
CREATE TABLE IF NOT EXISTS public.reservations (
  id TEXT PRIMARY KEY,
  court_id TEXT NOT NULL,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(court_id, date, time_slot)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_court_date ON public.reservations(court_id, date);
CREATE INDEX IF NOT EXISTS idx_reservations_court_date_slot ON public.reservations(court_id, date, time_slot);

-- Enable Row Level Security
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can insert reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can delete own reservations" ON public.reservations;

-- Policy: Anyone can read reservations (for availability checking)
CREATE POLICY "Anyone can read reservations" ON public.reservations
  FOR SELECT USING (true);

-- Policy: Authenticated users can insert reservations
CREATE POLICY "Authenticated users can insert reservations" ON public.reservations
  FOR INSERT WITH CHECK (true);

-- Policy: Users can update their own reservations
CREATE POLICY "Users can update own reservations" ON public.reservations
  FOR UPDATE USING (user_id = auth.uid()::text OR user_id LIKE 'guest-%');

-- Policy: Users can delete their own reservations
CREATE POLICY "Users can delete own reservations" ON public.reservations
  FOR DELETE USING (user_id = auth.uid()::text OR user_id LIKE 'guest-%');

-- =====================================================
-- 4. FUNCTION: Auto-create user profile on signup
-- Creates a profile in users table when auth user is created
-- =====================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_username TEXT;
  user_email TEXT;
  user_phone_prefix TEXT;
  user_phone_number TEXT;
BEGIN
  -- Extract username from metadata or email
  user_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    LOWER(SPLIT_PART(NEW.email, '@', 1))
  );
  
  -- Get email
  user_email := NEW.email;
  
  -- Get phone info from metadata (if available)
  user_phone_prefix := COALESCE(
    NEW.raw_user_meta_data->>'phone_prefix',
    '+216'
  );
  user_phone_number := NEW.raw_user_meta_data->>'phone_number';
  
  -- Determine provider
  DECLARE
    user_provider TEXT;
  BEGIN
    IF NEW.app_metadata->>'provider' = 'google' THEN
      user_provider := 'google';
    ELSE
      user_provider := 'email';
    END IF;
    
    -- Insert into users table
    INSERT INTO public.users (
      id,
      username,
      email,
      phone_prefix,
      phone_number,
      name,
      picture,
      provider
    )
    VALUES (
      NEW.id,
      user_username,
      user_email,
      user_phone_prefix,
      user_phone_number,
      COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        user_username
      ),
      COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture'
      ),
      user_provider
    )
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, users.name),
      picture = COALESCE(EXCLUDED.picture, users.picture),
      provider = EXCLUDED.provider,
      updated_at = NOW();
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 5. FUNCTION: Update updated_at timestamp
-- Automatically updates updated_at when row is modified
-- =====================================================

-- Function for users table
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for reservations table
DROP TRIGGER IF EXISTS update_reservations_updated_at ON public.reservations;
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. ENABLE REAL-TIME SUBSCRIPTIONS
-- Allows real-time updates for reservations
-- =====================================================

-- Enable replication for reservations table
-- Note: This needs to be done via Supabase Dashboard:
-- Database -> Replication -> Enable for 'reservations' table
-- But we'll add a comment here for reference

-- =====================================================
-- 7. GRANT PERMISSIONS
-- Ensure proper permissions are set
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;
GRANT SELECT, INSERT ON public.guest_users TO authenticated, anon;
GRANT SELECT ON public.guest_users TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT SELECT ON public.reservations TO anon;

-- =====================================================
-- 8. HELPER FUNCTIONS
-- Useful functions for the application
-- =====================================================

-- Function to check username availability
CREATE OR REPLACE FUNCTION public.check_username_available(check_username TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  exists_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO exists_count
  FROM public.users
  WHERE LOWER(username) = LOWER(check_username);
  
  RETURN exists_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_username_available(TEXT) TO authenticated, anon;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- 
-- Next steps:
-- 1. Go to Supabase Dashboard -> Authentication -> Settings
--    -> Auth Providers -> Email
--    -> Toggle OFF "Enable email confirmations"
--
-- 2. Go to Supabase Dashboard -> Database -> Replication
--    -> Enable replication for 'reservations' table
--    (for real-time updates)
--
-- 3. Configure Google OAuth (if using):
--    -> Authentication -> Providers -> Google
--    -> Enable and add your Google OAuth credentials
--
-- =====================================================

