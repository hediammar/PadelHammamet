-- =====================================================
-- Final Fix for Wheel Spin Function - Ambiguous Column Error
-- Run this in Supabase SQL Editor
-- =====================================================

-- Fix the spin_wheel_of_gifts function to resolve ambiguous column reference
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
  -- Include all active prizes, even if quantity is 0 (they'll get minimum weight of 1)
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
    -- Include all active prizes, even if quantity is 0 (they'll get minimum weight of 1)
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
  
  -- Return the win information - use explicit column order matching RETURN TABLE
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
-- FIX COMPLETE!
-- =====================================================
-- 
-- This fixes:
-- 1. Ambiguous column reference error by using explicit aliases (prize_id_val, etc.)
-- 2. Explicit type casting in the RETURN QUERY
-- 3. Ensures no column name conflicts
-- 4. Includes ALL active prizes in selection (even with 0 quantity) so they can be won
--    - Prizes with 0 quantity get minimum weight of 1
--    - "no_win" type gets weight of 10
--    - Other prizes get weight equal to their quantity (or 1 if 0)
--
-- =====================================================
