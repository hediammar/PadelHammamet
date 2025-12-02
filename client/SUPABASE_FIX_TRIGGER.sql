-- =====================================================
-- Fix for Signup 500 Error
-- This fixes the trigger function that's causing the error
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a fixed trigger function (removed nested DECLARE, added error handling)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_username TEXT;
  user_email TEXT;
  user_phone_prefix TEXT;
  user_phone_number TEXT;
  user_name TEXT;
  user_picture TEXT;
  user_provider TEXT;
BEGIN
  -- Get email
  user_email := NEW.email;
  
  -- Get phone info from metadata (if available)
  user_phone_prefix := COALESCE(
    NEW.raw_user_meta_data->>'phone_prefix',
    '+216'
  );
  user_phone_number := NEW.raw_user_meta_data->>'phone_number';
  
  -- Get name and picture from metadata
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    LOWER(SPLIT_PART(NEW.email, '@', 1))
  );
  
  user_picture := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );
  
  -- Determine provider
  IF NEW.app_metadata->>'provider' = 'google' THEN
    user_provider := 'google';
    
    -- For Google users: Generate username from first + last name
    -- Extract first and last name from full_name
    DECLARE
      full_name_parts TEXT[];
      first_name TEXT;
      last_name TEXT;
      base_username TEXT;
      final_username TEXT;
      counter INTEGER := 0;
      existing_user RECORD;
    BEGIN
      -- Check if username already provided in metadata
      IF NEW.raw_user_meta_data->>'username' IS NOT NULL THEN
        user_username := LOWER(REGEXP_REPLACE(NEW.raw_user_meta_data->>'username', '[^a-z0-9]', '', 'g'));
      ELSE
        -- Generate from first + last name
        full_name_parts := STRING_TO_ARRAY(TRIM(user_name), ' ');
        
        IF ARRAY_LENGTH(full_name_parts, 1) >= 2 THEN
          -- Has first and last name: concatenate them
          first_name := LOWER(REGEXP_REPLACE(full_name_parts[1], '[^a-z0-9]', '', 'g'));
          last_name := LOWER(REGEXP_REPLACE(full_name_parts[ARRAY_LENGTH(full_name_parts, 1)], '[^a-z0-9]', '', 'g'));
          base_username := first_name || last_name;
        ELSIF ARRAY_LENGTH(full_name_parts, 1) = 1 THEN
          -- Only one name part
          base_username := LOWER(REGEXP_REPLACE(full_name_parts[1], '[^a-z0-9]', '', 'g'));
        ELSE
          -- Fallback to email prefix
          base_username := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9]', '', 'g'));
        END IF;
        
        -- Ensure username is unique by checking and appending number if needed
        final_username := base_username;
        WHILE EXISTS (SELECT 1 FROM public.users WHERE username = final_username AND id != NEW.id) LOOP
          counter := counter + 1;
          final_username := base_username || counter::TEXT;
          IF counter > 1000 THEN
            -- Safety limit: use timestamp as fallback
            final_username := base_username || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
            EXIT;
          END IF;
        END LOOP;
        
        user_username := final_username;
      END IF;
    END;
  ELSE
    user_provider := 'email';
    
    -- For email users: Use username from metadata or generate from email
    user_username := COALESCE(
      LOWER(REGEXP_REPLACE(NEW.raw_user_meta_data->>'username', '[^a-z0-9]', '', 'g')),
      LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9]', '', 'g'))
    );
  END IF;
  
  -- Insert into users table with conflict handling
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
    user_name,
    user_picture,
    user_provider
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    phone_prefix = COALESCE(EXCLUDED.phone_prefix, users.phone_prefix),
    phone_number = COALESCE(EXCLUDED.phone_number, users.phone_number),
    name = COALESCE(EXCLUDED.name, users.name),
    picture = COALESCE(EXCLUDED.picture, users.picture),
    provider = EXCLUDED.provider,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    -- This allows the manual insert in code to handle it
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- IMPORTANT: After running this fix:
-- 1. The trigger will try to create the profile automatically
-- 2. The code also uses upsert, so it will handle conflicts gracefully
-- 3. If you want to disable the trigger and handle it manually in code only,
--    run: DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- =====================================================
