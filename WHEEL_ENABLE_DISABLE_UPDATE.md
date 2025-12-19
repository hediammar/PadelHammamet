# Wheel Enable/Disable Feature Update

## Overview
Added the ability for admins to globally enable or disable the Wheel of Gifts feature. This allows you to turn off the wheel during weeks when you don't want to run the promotion.

## Database Changes

### New Table: `wheel_settings`
A new table has been added to store the global wheel feature setting:

```sql
CREATE TABLE IF NOT EXISTS public.wheel_settings (
  id TEXT PRIMARY KEY DEFAULT 'wheel_settings', -- Single row table
  is_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES public.users(id)
);
```

**Note**: This table uses a single row with a fixed ID (`'wheel_settings'`) to store the global setting.

### SQL Update
The SQL file `client/WHEEL_OF_GIFTS_SETUP.sql` has been updated to include:
- The `wheel_settings` table creation
- RLS policies (anyone can read, admins can update)
- Default setting (enabled by default)
- Proper permissions

## Component Updates

### 1. WheelPopupManager
**Location**: `client/src/components/wheel/WheelPopupManager.tsx`

**Changes**:
- Now checks `wheel_settings.is_enabled` before showing the wheel popup
- If disabled, the popup will not appear even if the user is eligible to spin

### 2. WheelManagement (Admin)
**Location**: `client/src/components/admin/WheelManagement.tsx`

**New Features**:
- Added a toggle switch at the top of the admin interface
- Shows current status (enabled/disabled)
- Allows admins to instantly enable/disable the wheel feature
- Visual indicator with Power icon

## How to Use

### For Admins

1. **Go to Admin Panel** → **"Wheel of Gifts" tab**

2. **Find the "Wheel of Gifts Feature" card** at the top

3. **Toggle the switch** to enable/disable:
   - **ON (Green)**: Wheel is active, users can spin
   - **OFF (Gray)**: Wheel is disabled, no popup will show

4. **Status message** shows:
   - When enabled: "The wheel is currently active and will show to eligible users"
   - When disabled: "The wheel is disabled and will not show to users"

### Behavior

- **When Enabled**: 
  - Wheel popup appears automatically for eligible users (once per week)
  - All wheel functionality works normally

- **When Disabled**:
  - No wheel popup will appear, even for eligible users
  - Users cannot access the wheel
  - Admin can still manage prizes while disabled
  - Setting can be re-enabled at any time

## Database Migration

If you've already run the original SQL script, you need to add the new table. Run this in Supabase SQL Editor:

```sql
-- Create wheel_settings table
CREATE TABLE IF NOT EXISTS public.wheel_settings (
  id TEXT PRIMARY KEY DEFAULT 'wheel_settings',
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

-- Policy: Anyone can read wheel settings
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
```

## Use Cases

1. **Weekly Promotions**: Enable during promotional weeks, disable during regular weeks
2. **Inventory Management**: Disable when prizes are out of stock
3. **Maintenance**: Temporarily disable for maintenance or updates
4. **Seasonal**: Enable/disable based on seasons or special events

## Notes

- The setting takes effect immediately (no page refresh needed for users)
- When disabled, existing wins are still tracked in the database
- Admins can still manage prizes even when the wheel is disabled
- The default state is **enabled** (wheel is active by default)
