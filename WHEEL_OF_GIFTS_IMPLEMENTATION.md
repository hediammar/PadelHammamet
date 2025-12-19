# Wheel of Gifts Feature Implementation

## Overview
A complete "Wheel of Gifts" feature has been implemented that allows users to spin a wheel once per week to win prizes. Admins can manage prizes, set quantities, and track wins.

## Database Setup

### SQL File
Run the SQL script in Supabase SQL Editor:
- **File**: `client/WHEEL_OF_GIFTS_SETUP.sql`

This creates the following tables:
1. **wheel_prizes** - Stores all available prizes
2. **wheel_prize_inventory** - Tracks quantity of each prize
3. **user_wheel_spins** - Records when users spin (enforces once per week)
4. **user_wheel_wins** - Records what users won

### Database Functions
- `can_user_spin_wheel(user_id)` - Checks if user can spin (7 days since last spin)
- `spin_wheel_of_gifts(user_id)` - Handles the spin logic and prize selection

## Components Created

### 1. WheelOfGifts Component
**Location**: `client/src/components/wheel/WheelOfGifts.tsx`

- Visual wheel with spinning animation
- Displays all active prizes as segments
- Animated spin with smooth rotation
- Pointer indicator at the top

### 2. WheelOfGiftsModal Component
**Location**: `client/src/components/wheel/WheelOfGiftsModal.tsx`

- Popup modal for the wheel
- Checks user eligibility (once per week)
- Handles spin logic
- Displays winning prize
- Shows countdown until next spin

### 3. WheelPopupManager Component
**Location**: `client/src/components/wheel/WheelPopupManager.tsx`

- Global component that automatically shows wheel popup
- Checks if user can spin when they log in
- Integrated into Layout component

### 4. WheelManagement Component (Admin)
**Location**: `client/src/components/admin/WheelManagement.tsx`

- Admin interface to manage prizes
- Add/edit/delete prizes
- Set quantities for each prize
- Toggle prize active/inactive status
- View statistics (active prizes, total available, reserved)

## Features

### User Features
- ✅ Automatic popup when user can spin (once per week)
- ✅ Beautiful spinning wheel animation
- ✅ Prize display after spin
- ✅ Countdown until next spin
- ✅ "Tirage au sort" (no win) option

### Admin Features
- ✅ Add prizes with name, description, type, color, icon
- ✅ Set quantity for each prize
- ✅ Edit existing prizes
- ✅ Delete prizes
- ✅ Toggle prizes active/inactive
- ✅ View statistics dashboard
- ✅ Track reserved prizes (won but not claimed)

## Prize Types
1. **Physical** - Physical prizes (e.g., energy drinks, game passes)
2. **Digital** - Digital prizes (e.g., discount codes)
3. **No Win** - "Tirage au sort" (no prize won)

## How It Works

### For Users
1. User logs in
2. System checks if 7 days have passed since last spin
3. If eligible, wheel popup appears automatically (after 2 seconds)
4. User clicks "Spin the Wheel!"
5. Wheel spins and lands on a prize
6. Prize is recorded in database
7. User must wait 7 days for next spin

### For Admins
1. Go to Admin Panel → "Wheel of Gifts" tab
2. Click "Add Prize" to create new prizes
3. Set prize details:
   - Name (e.g., "Shark Energy Drink")
   - Description (optional)
   - Type (Physical/Digital/No Win)
   - Quantity (how many available)
   - Color (for wheel segment)
   - Icon/Emoji (for display)
4. Manage existing prizes (edit, delete, toggle active)
5. Update quantities as prizes are won

## Example Prizes Setup

```sql
-- Example: Add Shark Energy Drink
INSERT INTO wheel_prizes (name, description, prize_type, color, icon, is_active)
VALUES ('Shark Energy Drink', '1 can of Shark Energy Drink', 'physical', '#FF6B6B', '🥤', true);

-- Set quantity
INSERT INTO wheel_prize_inventory (prize_id, quantity)
VALUES ('<prize_id>', 10);

-- Example: Add 2 Games Pass
INSERT INTO wheel_prizes (name, description, prize_type, color, icon, is_active)
VALUES ('2 Games Pass', 'Pack of 2 game passes', 'physical', '#4ECDC4', '🎾', true);

-- Set quantity
INSERT INTO wheel_prize_inventory (prize_id, quantity)
VALUES ('<prize_id>', 4);

-- Example: Add 100 Dinars
INSERT INTO wheel_prizes (name, description, prize_type, color, icon, is_active)
VALUES ('100 Dinars', '100 TND cash prize', 'physical', '#FFE66D', '💰', true);

-- Set quantity
INSERT INTO wheel_prize_inventory (prize_id, quantity)
VALUES ('<prize_id>', 2);
```

## Integration Points

### Layout Component
The `WheelPopupManager` is integrated into the main Layout component, so it's available on all pages.

### Admin Panel
A new "Wheel of Gifts" tab has been added to the Admin Panel for managing prizes.

## Database Schema Details

### wheel_prizes
- `id` (UUID) - Primary key
- `name` (TEXT) - Prize name
- `description` (TEXT) - Optional description
- `prize_type` (TEXT) - 'physical', 'digital', or 'no_win'
- `color` (TEXT) - Hex color for wheel segment
- `icon` (TEXT) - Icon/emoji for display
- `is_active` (BOOLEAN) - Whether prize is active
- `created_at`, `updated_at` - Timestamps

### wheel_prize_inventory
- `id` (UUID) - Primary key
- `prize_id` (UUID) - Foreign key to wheel_prizes
- `quantity` (INTEGER) - Available quantity
- `reserved_quantity` (INTEGER) - Won but not claimed
- `created_at`, `updated_at` - Timestamps

### user_wheel_spins
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `spin_date` (DATE) - Date of spin (unique per user per date)
- `created_at` - Timestamp

### user_wheel_wins
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `prize_id` (UUID) - Foreign key to wheel_prizes
- `spin_id` (UUID) - Foreign key to user_wheel_spins
- `is_claimed` (BOOLEAN) - Whether prize was claimed
- `claimed_at` (TIMESTAMP) - When prize was claimed
- `created_at`, `updated_at` - Timestamps

## Security (RLS Policies)

- Users can only read their own spins and wins
- Users can insert their own spins
- Users can update their own wins (to claim)
- Admins can manage all prizes and inventory
- Anyone can read active prizes (for the wheel display)

## Next Steps

1. **Run the SQL script** in Supabase SQL Editor
2. **Add prizes** via Admin Panel
3. **Set quantities** for each prize
4. **Test the wheel** by logging in as a user
5. **Monitor wins** via Admin Panel

## Notes

- The wheel automatically appears 2 seconds after login if user is eligible
- Users can only spin once per week (7 days)
- The "Tirage au sort" (no win) prize is automatically created in the SQL script
- Prize selection is weighted by available quantity (more quantity = higher chance)
- The wheel animation takes 4 seconds to complete
- All prize management is done through the Admin Panel UI
