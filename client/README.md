# Padel Hammamet - Client Application

A modern React + TypeScript + Vite application for booking padel courts.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

The production build will be in the `dist` folder.

## 🌐 Environment Variables

Create a `.env` file in the root of the `client` directory with the following variables:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# API Base URL (optional - defaults to localhost in development)
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### Getting Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configure authorized JavaScript origins and redirect URIs
6. Copy the Client ID to your `.env` file

See `GOOGLE_OAUTH_SETUP.md` for detailed instructions.

## 📦 Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client` (if deploying from monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add environment variables:
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
   - `VITE_API_BASE_URL`: Your backend API URL (if applicable)
7. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd client
vercel

# For production deployment
vercel --prod
```

### Environment Variables in Vercel

1. Go to your project settings in Vercel Dashboard
2. Navigate to "Environment Variables"
3. Add the following:
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
   - `VITE_API_BASE_URL`: Your backend API URL (optional)

**Important**: After adding environment variables, redeploy your application for changes to take effect.

### Google OAuth Configuration for Production

When deploying to Vercel, make sure to:

1. Add your Vercel deployment URL to Google Cloud Console:
   - Go to Google Cloud Console → Credentials
   - Edit your OAuth 2.0 Client ID
   - Add authorized JavaScript origins:
     - `https://your-app.vercel.app`
     - `https://your-custom-domain.com` (if using custom domain)
   - Add authorized redirect URIs:
     - `https://your-app.vercel.app`
     - `https://your-custom-domain.com` (if using custom domain)

2. Wait 2-3 minutes after saving for changes to propagate

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Google OAuth** - Authentication

## 📁 Project Structure

```
client/
├── src/
│   ├── components/     # React components
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── styles/          # Global styles
│   └── utils/           # Utility functions
├── public/              # Static assets
├── dist/                # Build output (generated)
└── vercel.json          # Vercel configuration
```

## 🐛 Troubleshooting

### Build Errors

- Ensure all dependencies are installed: `npm install`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

### Google OAuth Not Working

- Verify `VITE_GOOGLE_CLIENT_ID` is set correctly
- Check that your domain is added to authorized origins in Google Cloud Console
- Wait a few minutes after adding origins for changes to propagate
- Clear browser cache

### Routing Issues on Vercel

The `vercel.json` file includes rewrite rules to handle client-side routing. If you encounter 404 errors on routes, ensure `vercel.json` is present in the root of your client directory.

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 📄 License

Private project - All rights reserved
