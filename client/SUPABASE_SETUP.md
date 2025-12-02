# Supabase Setup Guide

## Environment Variables

Create a `.env` file in the `client` directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://mtreaztnjlkiixjunjwv.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Google OAuth Configuration (if using)
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

**Note**: The code also supports `NEXT_PUBLIC_` prefix for compatibility, but `VITE_` is recommended for Vite projects.

## Database Tables Setup

Run the following SQL in your Supabase SQL Editor to create the required tables:

### 1. Users Table (for storing user information)

```sql
-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);
```

### 2. Guest Users Table

```sql
-- Create guest_users table
CREATE TABLE IF NOT EXISTS public.guest_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.guest_users ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert guest users
CREATE POLICY "Anyone can insert guest users" ON public.guest_users
  FOR INSERT WITH CHECK (true);

-- Policy: Users can read guest users (for their own bookings)
CREATE POLICY "Users can read guest users" ON public.guest_users
  FOR SELECT USING (true);
```

### 3. Reservations Table

```sql
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_court_date ON public.reservations(court_id, date);

-- Enable Row Level Security
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read reservations
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
```

## Authentication Providers Setup

### Google OAuth

1. Go to your Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth Client ID and Secret
4. Add authorized redirect URLs:
   - `http://localhost:5173` (for development)
   - `https://your-domain.com` (for production)

### Apple OAuth

1. Go to your Supabase Dashboard → Authentication → Providers
2. Enable Apple provider
3. Configure Apple OAuth credentials:
   - Service ID
   - Team ID
   - Key ID
   - Private Key
4. Add authorized redirect URLs:
   - `http://localhost:5173` (for development)
   - `https://your-domain.com` (for production)

## Real-time Subscriptions

The app uses Supabase real-time subscriptions to sync reservations across clients. Make sure:

1. Go to Database → Replication in Supabase Dashboard
2. Enable replication for the `reservations` table
3. This allows real-time updates when bookings are created or cancelled

## Testing

After setting up:

1. Make sure your `.env` file has the correct Supabase credentials
2. Run `npm run dev` in the client directory
3. Try signing in with Google or Apple
4. Create a test reservation
5. Check your Supabase dashboard to verify data is being saved

