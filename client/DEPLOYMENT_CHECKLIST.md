# Vercel Deployment Checklist

## Pre-Deployment

- [x] All dependencies are installed (`npm install`)
- [x] Build runs successfully (`npm run build`)
- [x] No TypeScript errors (`tsc --noEmit`)
- [x] No linting errors (`npm run lint`)
- [x] Environment variables documented in `.env.example`

## Vercel Configuration

- [x] `vercel.json` created with proper routing configuration
- [x] `package.json` has correct build scripts
- [x] `index.html` has proper title and meta tags
- [x] `.gitignore` includes `.env` files

## Environment Variables Setup

Before deploying, ensure you have:

1. **VITE_GOOGLE_CLIENT_ID**
   - Get from Google Cloud Console
   - Add to Vercel project settings → Environment Variables
   - Add your Vercel domain to authorized origins in Google Cloud Console

2. **VITE_API_BASE_URL** (Optional)
   - Only needed if you have a backend API
   - Set to your backend API URL

## Deployment Steps

1. **Push to Git Repository**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. **Deploy via Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import your repository
   - Configure:
     - Framework Preset: Vite
     - Root Directory: `client` (if deploying from monorepo)
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variables
   - Click "Deploy"

3. **Configure Google OAuth**
   - After deployment, copy your Vercel URL
   - Go to Google Cloud Console → Credentials
   - Edit your OAuth 2.0 Client ID
   - Add authorized JavaScript origins:
     - `https://your-app.vercel.app`
   - Add authorized redirect URIs:
     - `https://your-app.vercel.app`
   - Wait 2-3 minutes for changes to propagate

4. **Test Deployment**
   - Visit your Vercel URL
   - Test all routes (/, /booking-alternative, /profile, etc.)
   - Test Google sign-in functionality
   - Test booking flow

## Post-Deployment

- [ ] Verify all routes work correctly
- [ ] Test Google OAuth sign-in
- [ ] Test booking functionality
- [ ] Check mobile responsiveness
- [ ] Verify environment variables are set correctly
- [ ] Set up custom domain (if needed)
- [ ] Configure analytics (if needed)

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### Routes Return 404
- Verify `vercel.json` is in the root of `client` folder
- Check that rewrite rules are correct

### Google OAuth Not Working
- Verify `VITE_GOOGLE_CLIENT_ID` is set in Vercel
- Check authorized origins in Google Cloud Console
- Ensure Vercel URL is added to authorized origins
- Wait a few minutes after changes

### Environment Variables Not Working
- Redeploy after adding environment variables
- Verify variable names start with `VITE_`
- Check Vercel project settings → Environment Variables

## Quick Deploy Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from client directory)
cd client
vercel

# Deploy to production
vercel --prod
```

