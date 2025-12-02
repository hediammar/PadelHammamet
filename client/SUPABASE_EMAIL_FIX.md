# Supabase Email Validation Fix

## Issue
Supabase is rejecting email addresses during signup with error: `email_address_invalid`

## Current Email Format
The app uses: `username_phone@example.com`

## Solutions to Try

### Option 1: Use a Real Domain (Recommended)
If you have a domain, configure it in Supabase:
1. Go to Supabase Dashboard → Authentication → Settings
2. Under "Site URL", add your domain
3. Update the email format in code to use your real domain

### Option 2: Disable Email Validation (If Available)
Some Supabase configurations allow disabling strict email validation:
1. Go to Supabase Dashboard → Authentication → Settings
2. Look for "Email validation" or "Strict email validation" option
3. Disable if available

### Option 3: Use a Different Email Format
If `example.com` doesn't work, try:
- `username_phone@test.com`
- `username_phone@mail.com`
- Or use UUID-based: `user_${uuid}@example.com`

### Option 4: Configure Custom SMTP (For Production)
For production, set up a real email domain:
1. Go to Supabase Dashboard → Authentication → Settings → SMTP Settings
2. Configure your SMTP provider
3. Use your real domain in email format

## Current Code Location
The email format is set in: `client/src/context/AuthContext.tsx` line ~292

## Testing
After making changes, test signup again. The email format should be:
- Starts with a letter (username)
- Contains only alphanumeric characters and underscore before @
- Uses a valid domain format

