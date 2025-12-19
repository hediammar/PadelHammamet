-- =====================================================
-- JACKPOT MACHINE SETUP - Simplified Prize System
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing wheel tables if they exist (optional - only if you want to clean up)
-- DROP TABLE IF EXISTS public.user_wheel_wins CASCADE;
-- DROP TABLE IF EXISTS public.user_wheel_spins CASCADE;
-- DROP TABLE IF EXISTS public.wheel_prize_inventory CASCADE;
-- DROP TABLE IF EXISTS public.wheel_prizes CASCADE;
-- DROP TABLE IF EXISTS public.wheel_settings CASCADE;

-- =====================================================
-- 1. PRIZES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.jackpot_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  prize_type TEXT NOT NULL CHECK (prize_type IN ('physical', 'discount', 'no_win')),
  emoji TEXT, -- Emoji to display in jackpot machine
  icon TEXT, -- Alternative icon if emoji not available
  is_active BOOLEAN DEFAULT true,
  weight INTEGER DEFAULT 1, -- Probability weight (higher = more likely)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. USER SPINS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_jackpot_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spin_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, spin_date)
);

-- =====================================================
-- 3. USER WINS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_jackpot_wins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prize_id UUID NOT NULL REFERENCES public.jackpot_prizes(id) ON DELETE CASCADE,
  spin_id UUID NOT NULL REFERENCES public.user_jackpot_spins(id) ON DELETE CASCADE,
  claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. JACKPOT SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.jackpot_settings (
  id TEXT PRIMARY KEY DEFAULT 'jackpot_settings',
  is_enabled BOOLEAN DEFAULT true,
  spins_per_week INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.jackpot_settings (id, is_enabled, spins_per_week)
VALUES ('jackpot_settings', true, 1)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_jackpot_spins_user_date ON public.user_jackpot_spins(user_id, spin_date);
CREATE INDEX IF NOT EXISTS idx_user_jackpot_wins_user ON public.user_jackpot_wins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_jackpot_wins_prize ON public.user_jackpot_wins(prize_id);
CREATE INDEX IF NOT EXISTS idx_jackpot_prizes_active ON public.jackpot_prizes(is_active);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.jackpot_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_jackpot_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_jackpot_wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jackpot_settings ENABLE ROW LEVEL SECURITY;

-- Prizes: Everyone can read active prizes
CREATE POLICY "Anyone can view active prizes"
  ON public.jackpot_prizes FOR SELECT
  USING (is_active = true);

-- User spins: Users can only see their own spins
CREATE POLICY "Users can view own spins"
  ON public.user_jackpot_spins FOR SELECT
  USING (auth.uid() = user_id);

-- User wins: Users can only see their own wins
CREATE POLICY "Users can view own wins"
  ON public.user_jackpot_wins FOR SELECT
  USING (auth.uid() = user_id);

-- Settings: Everyone can read settings
CREATE POLICY "Anyone can view settings"
  ON public.jackpot_settings FOR SELECT
  USING (true);

-- =====================================================
-- 7. HELPER FUNCTION: Check if user can spin
-- =====================================================
CREATE OR REPLACE FUNCTION public.can_user_spin_jackpot(check_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  settings_record RECORD;
  last_spin_date DATE;
  spins_this_week INTEGER;
BEGIN
  -- Get settings
  SELECT * INTO settings_record
  FROM public.jackpot_settings
  WHERE id = 'jackpot_settings';
  
  -- Check if jackpot is enabled
  IF NOT settings_record.is_enabled THEN
    RETURN false;
  END IF;
  
  -- Get last spin date
  SELECT MAX(spin_date) INTO last_spin_date
  FROM public.user_jackpot_spins
  WHERE user_id = check_user_id;
  
  -- If never spun, can spin
  IF last_spin_date IS NULL THEN
    RETURN true;
  END IF;
  
  -- Count spins this week (last 7 days)
  SELECT COUNT(*) INTO spins_this_week
  FROM public.user_jackpot_spins
  WHERE user_id = check_user_id
    AND spin_date >= CURRENT_DATE - INTERVAL '7 days';
  
  -- Can spin if under limit
  RETURN spins_this_week < settings_record.spins_per_week;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. MAIN FUNCTION: Spin the jackpot
-- =====================================================
CREATE OR REPLACE FUNCTION public.spin_jackpot(spin_user_id UUID)
RETURNS TABLE(
  win_id UUID,
  prize_id UUID,
  prize_name TEXT,
  prize_description TEXT,
  prize_type TEXT,
  prize_emoji TEXT
) AS $$
DECLARE
  new_spin_id UUID;
  selected_prize_id UUID;
  prize_name_val TEXT;
  prize_description_val TEXT;
  prize_type_val TEXT;
  prize_emoji_val TEXT;
  new_win_id UUID;
  available_prizes RECORD;
  total_weight INTEGER := 0;
  random_value INTEGER;
  current_weight INTEGER := 0;
BEGIN
  -- Check if user can spin
  IF NOT public.can_user_spin_jackpot(spin_user_id) THEN
    RAISE EXCEPTION 'User cannot spin yet. Please wait until next week.';
  END IF;
  
  -- Record the spin
  INSERT INTO public.user_jackpot_spins (user_id, spin_date)
  VALUES (spin_user_id, CURRENT_DATE)
  ON CONFLICT (user_id, spin_date) DO NOTHING
  RETURNING id INTO new_spin_id;
  
  -- Get the spin_id if it already existed
  IF new_spin_id IS NULL THEN
    SELECT id INTO new_spin_id
    FROM public.user_jackpot_spins
    WHERE user_id = spin_user_id AND spin_date = CURRENT_DATE;
    
    IF new_spin_id IS NULL THEN
      RAISE EXCEPTION 'Failed to record spin. Please try again.';
    END IF;
  END IF;
  
  -- Calculate total weight of all active prizes
  FOR available_prizes IN
    SELECT 
      p.id AS prize_id_val,
      p.name AS prize_name_val,
      p.description AS prize_desc_val,
      p.prize_type AS prize_type_val,
      p.emoji AS prize_emoji_val,
      p.weight AS prize_weight
    FROM public.jackpot_prizes p
    WHERE p.is_active = true
  LOOP
    total_weight := total_weight + available_prizes.prize_weight;
  END LOOP;
  
  -- If no prizes available, return error
  IF total_weight = 0 THEN
    RAISE EXCEPTION 'No prizes configured.';
  END IF;
  
  -- Generate random value between 1 and total_weight
  random_value := floor(random() * total_weight) + 1;
  
  -- Select prize based on weighted random
  current_weight := 0;
  FOR available_prizes IN
    SELECT 
      p.id AS prize_id_val,
      p.name AS prize_name_val,
      p.description AS prize_desc_val,
      p.prize_type AS prize_type_val,
      p.emoji AS prize_emoji_val,
      p.weight AS prize_weight
    FROM public.jackpot_prizes p
    WHERE p.is_active = true
    ORDER BY p.id
  LOOP
    current_weight := current_weight + available_prizes.prize_weight;
    
    IF random_value <= current_weight THEN
      selected_prize_id := available_prizes.prize_id_val;
      prize_name_val := available_prizes.prize_name_val;
      prize_description_val := available_prizes.prize_desc_val;
      prize_type_val := available_prizes.prize_type_val;
      prize_emoji_val := available_prizes.prize_emoji_val;
      EXIT;
    END IF;
  END LOOP;
  
  -- Record the win
  INSERT INTO public.user_jackpot_wins (user_id, prize_id, spin_id)
  VALUES (spin_user_id, selected_prize_id, new_spin_id)
  RETURNING id INTO new_win_id;
  
  -- Return the win information
  RETURN QUERY 
  SELECT 
    new_win_id::UUID,
    selected_prize_id::UUID,
    prize_name_val::TEXT,
    prize_description_val::TEXT,
    prize_type_val::TEXT,
    prize_emoji_val::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================
GRANT SELECT ON public.jackpot_prizes TO authenticated, anon;
GRANT SELECT ON public.user_jackpot_spins TO authenticated;
GRANT SELECT ON public.user_jackpot_wins TO authenticated;
GRANT SELECT ON public.jackpot_settings TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.can_user_spin_jackpot(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.spin_jackpot(UUID) TO authenticated;

-- =====================================================
-- 10. INSERT SAMPLE PRIZES
-- =====================================================
INSERT INTO public.jackpot_prizes (name, description, prize_type, emoji, weight) VALUES
  ('Tirage au sort', 'Better luck next time!', 'no_win', '🎲', 10),
  ('Shark Energy', 'A refreshing energy drink!', 'physical', '⚡', 5),
  ('100 Dinars', 'Cash prize!', 'discount', '💰', 3)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- 
-- This creates a simplified jackpot system with:
-- 1. Prize management (with emojis)
-- 2. User spin tracking (1 per week)
-- 3. Win recording
-- 4. Weighted random prize selection
-- 5. RLS policies for security
-- 
-- To use:
-- 1. Call spin_jackpot(user_id) to spin
-- 2. Returns prize with emoji for display
-- 3. Frontend shows jackpot machine animation
-- 
-- =====================================================
