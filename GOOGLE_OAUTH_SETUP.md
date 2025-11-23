# Google OAuth Setup Guide

## Current Client ID
Your Google OAuth Client ID: `282612058234-bo5pig4u650c08ipepjbfik7rukgi5a3.apps.googleusercontent.com`

## Step 1: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **base25-466809**
3. Navigate to **APIs & Services** > **Credentials**
4. Find your OAuth 2.0 Client ID: `282612058234-bo5pig4u650c08ipepjbfik7rukgi5a3.apps.googleusercontent.com`
5. Click **Edit** (pencil icon)

## Step 2: Add Authorized JavaScript Origins

In the **Authorized JavaScript origins** section, add:

```
http://localhost
http://localhost:5173
http://localhost:3000
http://127.0.0.1:5173
```

**Important for One Tap:**
- Add BOTH `http://localhost` (without port) AND `http://localhost:5173` (with port)
- Google One Tap requires both variations for localhost to work properly
- Make sure there are NO trailing slashes
- The default Vite dev server port is `5173`. If your app runs on a different port, add that port instead
- Wait 2-3 minutes after saving for changes to propagate

## Step 3: Add Authorized Redirect URIs

In the **Authorized redirect URIs** section, add:

```
http://localhost:5173
http://localhost:3000
http://127.0.0.1:5173
```

## Step 4: Save Changes

Click **Save** at the bottom of the page.

## Step 5: Restart Your Dev Server

After saving, restart your Vite dev server:

```bash
npm run dev
```

## Troubleshooting

### Error: "The given origin is not allowed"
- Make sure you've added the correct origin (including the port number)
- Wait a few minutes after saving for changes to propagate
- Clear your browser cache and try again

### Error: "invalid_client"
- Verify the Client ID in your `.env` file matches exactly
- Make sure there are no extra spaces or quotes in the `.env` file
- Restart your dev server after changing `.env`

### One Tap Sign-in Errors (Top Right Popup)
If you see errors related to One Tap sign-in (the shortcut in the top right):

**Common Issues:**
1. **"The given origin is not allowed"**
   - Make sure `http://localhost:5173` is added to **Authorized JavaScript origins**
   - Wait 2-3 minutes after saving for changes to propagate
   - Clear your browser cache completely
   - Try in an incognito/private window

2. **"idpiframe_initialization_failed"**
   - This usually means the origin isn't configured yet
   - Double-check the origin matches exactly (no trailing slash, correct port)
   - Wait a few minutes and refresh

3. **One Tap not showing at all**
   - One Tap only shows if:
     - User is signed out
     - User hasn't dismissed it before
     - Origin is properly configured
   - Try clearing browser cache and cookies for localhost
   - Try in an incognito window

**Note:** One Tap works with localhost! The issue is usually configuration-related.

### Still having issues?
- Check the browser console for specific error messages
- Verify the Client ID is correct in Google Cloud Console
- Make sure you're using the correct OAuth client (Web application type)
- Clear your browser cache completely

