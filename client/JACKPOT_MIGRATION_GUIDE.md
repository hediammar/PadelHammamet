# Jackpot Machine Migration Guide

## Overview
The wheel of gifts has been replaced with a simpler **Jackpot Machine** that uses emoji-based slot machine animation instead of complex rotation calculations.

## What Changed

### 1. Database Tables
- `wheel_prizes` → `jackpot_prizes`
- `user_wheel_spins` → `user_jackpot_spins`
- `user_wheel_wins` → `user_jackpot_wins`
- `wheel_settings` → `jackpot_settings`

### 2. Database Functions
- `can_user_spin_wheel()` → `can_user_spin_jackpot()`
- `spin_wheel_of_gifts()` → `spin_jackpot()`

### 3. Components
- `WheelOfGifts.tsx` → `JackpotMachine.tsx` (new simpler component)
- Updated `WheelOfGiftsModal.tsx` to use `JackpotMachine`
- Updated `PrizeModal.tsx` to display emoji from prize
- Updated `WheelPopupManager.tsx` to use new tables/functions

## Setup Instructions

### Step 1: Run the SQL Script
1. Open Supabase SQL Editor
2. Run `JACKPOT_SETUP.sql`
3. This will create all necessary tables, functions, and sample prizes

### Step 2: Clean Up Old Tables (Optional)
If you want to remove the old wheel tables, you can run:
```sql
DROP TABLE IF EXISTS public.user_wheel_wins CASCADE;
DROP TABLE IF EXISTS public.user_wheel_spins CASCADE;
DROP TABLE IF EXISTS public.wheel_prize_inventory CASCADE;
DROP TABLE IF EXISTS public.wheel_prizes CASCADE;
DROP TABLE IF EXISTS public.wheel_settings CASCADE;
DROP FUNCTION IF EXISTS public.can_user_spin_wheel(UUID);
DROP FUNCTION IF EXISTS public.spin_wheel_of_gifts(UUID);
```

### Step 3: Add Prizes
The SQL script includes sample prizes:
- 🎲 Tirage au sort (no_win, weight: 10)
- ⚡ Shark Energy (physical, weight: 5)
- 💰 100 Dinars (discount, weight: 3)

You can add more prizes via Supabase dashboard or SQL:
```sql
INSERT INTO public.jackpot_prizes (name, description, prize_type, emoji, weight)
VALUES ('Your Prize Name', 'Description', 'physical', '🎁', 5);
```

## How It Works

1. **User spins**: Calls `spin_jackpot(user_id)`
2. **Backend selects**: Weighted random selection based on prize weights
3. **Frontend displays**: 3-slot jackpot machine animation
4. **All slots match**: Shows the winning prize with emoji
5. **Prize modal**: Displays the result

## Prize Weights
- Higher weight = more likely to win
- `no_win` prizes typically have higher weights (e.g., 10)
- Real prizes have lower weights (e.g., 3-5)

## Benefits
✅ **Simpler**: No complex rotation calculations
✅ **Reliable**: Always shows correct prize
✅ **Visual**: Fun slot machine animation
✅ **Maintainable**: Easy to add/remove prizes
✅ **Flexible**: Supports emoji or icon display

## Testing
1. Make sure SQL script is run
2. Test spin functionality
3. Verify prizes display correctly with emojis
4. Check that prize modal shows correct information
