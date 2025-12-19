-- =====================================================
-- Wheel of Gifts Database Setup for Padel Hammamet
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. WHEEL_PRIZES TABLE
-- Stores the prizes available on the wheel
-- =====================================================

CREATE TABLE IF NOT EXISTS public.wheel_prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  prize_type TEXT NOT NULL DEFAULT 'physical', -- 'physical', 'digital', 'no_win'
  color TEXT, -- Color for the wheel segment (hex code)
  icon TEXT, -- Icon name or emoji
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wheel_prizes_active ON public.wheel_prizes(is_active);
CREATE INDEX IF NOT EXISTS idx_wheel_prizes_type ON public.wheel_prizes(prize_type);

-- Enable Row Level Security
ALTER TABLE public.wheel_prizes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read active prizes" ON public.wheel_prizes;
DROP POLICY IF EXISTS "Admins can manage prizes" ON public.wheel_prizes;

-- Policy: Anyone can read active prizes (for the wheel)
CREATE POLICY "Anyone can read active prizes" ON public.wheel_prizes
  FOR SELECT USING (is_active = true);

-- Policy: Admins can manage prizes (check if user is admin)
-- Note: You'll need to adjust this based on your admin check logic
CREATE POLICY "Admins can manage prizes" ON public.wheel_prizes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- 2. WHEEL_PRIZE_INVENTORY TABLE
-- Stores the quantity of each prize available
-- =====================================================

CREATE TABLE IF NOT EXISTS public.wheel_prize_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prize_id UUID NOT NULL REFERENCES public.wheel_prizes(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0, -- Prizes won but not yet claimed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prize_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wheel_prize_inventory_prize_id ON public.wheel_prize_inventory(prize_id);

-- Enable Row Level Security
ALTER TABLE public.wheel_prize_inventory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read inventory" ON public.wheel_prize_inventory;
DROP POLICY IF EXISTS "Admins can manage inventory" ON public.wheel_prize_inventory;

-- Policy: Anyone can read inventory (to check availability)
CREATE POLICY "Anyone can read inventory" ON public.wheel_prize_inventory
  FOR SELECT USING (true);

-- Policy: Admins can manage inventory
CREATE POLICY "Admins can manage inventory" ON public.wheel_prize_inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- 3. USER_WHEEL_SPINS TABLE
-- Tracks when users spin the wheel (to enforce once per week)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_wheel_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  spin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, spin_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_wheel_spins_user_id ON public.user_wheel_spins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wheel_spins_date ON public.user_wheel_spins(spin_date);
CREATE INDEX IF NOT EXISTS idx_user_wheel_spins_user_date ON public.user_wheel_spins(user_id, spin_date);

-- Enable Row Level Security
ALTER TABLE public.user_wheel_spins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own spins" ON public.user_wheel_spins;
DROP POLICY IF EXISTS "Users can insert own spins" ON public.user_wheel_spins;
DROP POLICY IF EXISTS "Admins can read all spins" ON public.user_wheel_spins;

-- Policy: Users can read their own spins
CREATE POLICY "Users can read own spins" ON public.user_wheel_spins
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own spins
CREATE POLICY "Users can insert own spins" ON public.user_wheel_spins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can read all spins
CREATE POLICY "Admins can read all spins" ON public.user_wheel_spins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- 4. USER_WHEEL_WINS TABLE
-- Tracks what users won from the wheel
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_wheel_wins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prize_id UUID NOT NULL REFERENCES public.wheel_prizes(id) ON DELETE CASCADE,
  spin_id UUID NOT NULL REFERENCES public.user_wheel_spins(id) ON DELETE CASCADE,
  is_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_wheel_wins_user_id ON public.user_wheel_wins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wheel_wins_prize_id ON public.user_wheel_wins(prize_id);
CREATE INDEX IF NOT EXISTS idx_user_wheel_wins_spin_id ON public.user_wheel_wins(spin_id);
CREATE INDEX IF NOT EXISTS idx_user_wheel_wins_claimed ON public.user_wheel_wins(is_claimed);

-- Enable Row Level Security
ALTER TABLE public.user_wheel_wins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own wins" ON public.user_wheel_wins;
DROP POLICY IF EXISTS "Users can update own wins" ON public.user_wheel_wins;
DROP POLICY IF EXISTS "Users can insert own wins" ON public.user_wheel_wins;
DROP POLICY IF EXISTS "Admins can read all wins" ON public.user_wheel_wins;
DROP POLICY IF EXISTS "Admins can update all wins" ON public.user_wheel_wins;

-- Policy: Users can read their own wins
CREATE POLICY "Users can read own wins" ON public.user_wheel_wins
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update their own wins (to claim prizes)
CREATE POLICY "Users can update own wins" ON public.user_wheel_wins
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: System can insert wins (via function)
CREATE POLICY "Users can insert own wins" ON public.user_wheel_wins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can read all wins
CREATE POLICY "Admins can read all wins" ON public.user_wheel_wins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can update all wins
CREATE POLICY "Admins can update all wins" ON public.user_wheel_wins
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- 5. FUNCTION: Check if user can spin (once per week)
-- =====================================================

CREATE OR REPLACE FUNCTION public.can_user_spin_wheel(check_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  last_spin_date DATE;
  days_since_spin INTEGER;
BEGIN
  -- Get the most recent spin date for this user
  SELECT MAX(spin_date) INTO last_spin_date
  FROM public.user_wheel_spins
  WHERE user_id = check_user_id;
  
  -- If user has never spun, they can spin
  IF last_spin_date IS NULL THEN
    RETURN true;
  END IF;
  
  -- Calculate days since last spin
  days_since_spin := CURRENT_DATE - last_spin_date;
  
  -- User can spin if 7 or more days have passed
  RETURN days_since_spin >= 7;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.can_user_spin_wheel(UUID) TO authenticated, anon;

-- =====================================================
-- 6. FUNCTION: Record wheel spin and determine prize
-- =====================================================

CREATE OR REPLACE FUNCTION public.spin_wheel_of_gifts(spin_user_id UUID)
RETURNS TABLE(
  win_id UUID,
  prize_id UUID,
  prize_name TEXT,
  prize_description TEXT,
  prize_type TEXT
) AS $$
DECLARE
  new_spin_id UUID;
  selected_prize_id UUID;
  prize_name_val TEXT;
  prize_description_val TEXT;
  prize_type_val TEXT;
  new_win_id UUID;
  available_prizes RECORD;
  total_weight INTEGER := 0;
  random_value INTEGER;
  current_weight INTEGER := 0;
BEGIN
  -- Check if user can spin
  IF NOT public.can_user_spin_wheel(spin_user_id) THEN
    RAISE EXCEPTION 'User cannot spin yet. Please wait until next week.';
  END IF;
  
  -- Record the spin (or get existing if already spun today)
  INSERT INTO public.user_wheel_spins (user_id, spin_date)
  VALUES (spin_user_id, CURRENT_DATE)
  ON CONFLICT (user_id, spin_date) DO NOTHING
  RETURNING id INTO new_spin_id;
  
  -- Get the spin_id if it already existed (user already spun today)
  IF new_spin_id IS NULL THEN
    SELECT id INTO new_spin_id
    FROM public.user_wheel_spins
    WHERE user_id = spin_user_id AND spin_date = CURRENT_DATE;
    
    -- If still NULL, something went wrong
    IF new_spin_id IS NULL THEN
      RAISE EXCEPTION 'Failed to record spin. Please try again.';
    END IF;
  END IF;
  
  -- Get all active prizes with their available quantities
  -- Calculate total weight (quantity available)
  FOR available_prizes IN
    SELECT 
      p.id AS prize_id_val,
      p.name AS prize_name_val,
      p.description AS prize_desc_val,
      p.prize_type AS prize_type_val,
      COALESCE(i.quantity, 0) as available_qty
    FROM public.wheel_prizes p
    LEFT JOIN public.wheel_prize_inventory i ON p.id = i.prize_id
    WHERE p.is_active = true
    AND (p.prize_type = 'no_win' OR COALESCE(i.quantity, 0) > 0)
  LOOP
    -- For "no_win" type, give it a base weight of 10
    -- For other prizes, use their available quantity
    IF available_prizes.prize_type_val = 'no_win' THEN
      total_weight := total_weight + 10;
    ELSE
      total_weight := total_weight + GREATEST(available_prizes.available_qty, 1);
    END IF;
  END LOOP;
  
  -- If no prizes available, return no_win
  IF total_weight = 0 THEN
    SELECT id, name, description, prize_type 
    INTO selected_prize_id, prize_name_val, prize_description_val, prize_type_val
    FROM public.wheel_prizes
    WHERE prize_type = 'no_win' AND is_active = true
    LIMIT 1;
    
    IF selected_prize_id IS NULL THEN
      RAISE EXCEPTION 'No prizes configured on the wheel.';
    END IF;
  ELSE
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
        COALESCE(i.quantity, 0) as available_qty
      FROM public.wheel_prizes p
      LEFT JOIN public.wheel_prize_inventory i ON p.id = i.prize_id
      WHERE p.is_active = true
      AND (p.prize_type = 'no_win' OR COALESCE(i.quantity, 0) > 0)
      ORDER BY p.id
    LOOP
      IF available_prizes.prize_type_val = 'no_win' THEN
        current_weight := current_weight + 10;
      ELSE
        current_weight := current_weight + GREATEST(available_prizes.available_qty, 1);
      END IF;
      
      IF random_value <= current_weight THEN
        selected_prize_id := available_prizes.prize_id_val;
        prize_name_val := available_prizes.prize_name_val;
        prize_description_val := available_prizes.prize_desc_val;
        prize_type_val := available_prizes.prize_type_val;
        EXIT;
      END IF;
    END LOOP;
  END IF;
  
  -- Record the win
  INSERT INTO public.user_wheel_wins (user_id, prize_id, spin_id)
  VALUES (spin_user_id, selected_prize_id, new_spin_id)
  RETURNING id INTO new_win_id;
  
  -- Decrease inventory if not a no_win
  IF prize_type_val != 'no_win' THEN
    UPDATE public.wheel_prize_inventory
    SET quantity = GREATEST(quantity - 1, 0),
        reserved_quantity = reserved_quantity + 1,
        updated_at = NOW()
    WHERE prize_id = selected_prize_id;
  END IF;
  
  -- Return the win information
  RETURN QUERY 
  SELECT 
    new_win_id::UUID,
    selected_prize_id::UUID,
    prize_name_val::TEXT,
    prize_description_val::TEXT,
    prize_type_val::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.spin_wheel_of_gifts(UUID) TO authenticated;

-- =====================================================
-- 7. FUNCTION: Update updated_at timestamp
-- =====================================================

-- Trigger for wheel_prizes table
DROP TRIGGER IF EXISTS update_wheel_prizes_updated_at ON public.wheel_prizes;
CREATE TRIGGER update_wheel_prizes_updated_at
  BEFORE UPDATE ON public.wheel_prizes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for wheel_prize_inventory table
DROP TRIGGER IF EXISTS update_wheel_prize_inventory_updated_at ON public.wheel_prize_inventory;
CREATE TRIGGER update_wheel_prize_inventory_updated_at
  BEFORE UPDATE ON public.wheel_prize_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for user_wheel_wins table
DROP TRIGGER IF EXISTS update_user_wheel_wins_updated_at ON public.user_wheel_wins;
CREATE TRIGGER update_user_wheel_wins_updated_at
  BEFORE UPDATE ON public.user_wheel_wins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions on tables
GRANT SELECT ON public.wheel_prizes TO authenticated, anon;
GRANT SELECT ON public.wheel_prize_inventory TO authenticated, anon;
GRANT SELECT, INSERT ON public.user_wheel_spins TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_wheel_wins TO authenticated;

-- Grant admin permissions
-- Note: Admin permissions are handled via RLS policies above

-- =====================================================
-- 9. WHEEL_SETTINGS TABLE
-- Stores global wheel feature settings (enabled/disabled)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.wheel_settings (
  id TEXT PRIMARY KEY DEFAULT 'wheel_settings', -- Single row table
  is_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES public.users(id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_wheel_settings_enabled ON public.wheel_settings(is_enabled);

-- Enable Row Level Security
ALTER TABLE public.wheel_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read wheel settings" ON public.wheel_settings;
DROP POLICY IF EXISTS "Admins can update wheel settings" ON public.wheel_settings;

-- Policy: Anyone can read wheel settings (to check if enabled)
CREATE POLICY "Anyone can read wheel settings" ON public.wheel_settings
  FOR SELECT USING (true);

-- Policy: Admins can update wheel settings
CREATE POLICY "Admins can update wheel settings" ON public.wheel_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Insert default settings (enabled by default)
INSERT INTO public.wheel_settings (id, is_enabled)
VALUES ('wheel_settings', true)
ON CONFLICT (id) DO NOTHING;

-- Grant permissions
GRANT SELECT ON public.wheel_settings TO authenticated, anon;
GRANT UPDATE ON public.wheel_settings TO authenticated;

-- =====================================================
-- 10. INSERT DEFAULT "NO WIN" PRIZE
-- =====================================================

-- Insert default "Tirage au sort" (no win) prize if it doesn't exist
INSERT INTO public.wheel_prizes (name, description, prize_type, color, icon, is_active)
VALUES (
  'Tirage au sort',
  'Better luck next time!',
  'no_win',
  '#6B7280',
  '🎲',
  true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- 
-- Next steps:
-- 1. Go to Supabase Dashboard -> Database -> Replication
--    -> Enable replication for wheel-related tables if needed
--
-- 2. Use the Admin Panel to add prizes and set quantities
--
-- 3. The wheel will automatically show to users once per week
--
-- =====================================================
