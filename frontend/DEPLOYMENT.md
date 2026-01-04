# Frontend Deployment Guide

## Vercel Environment Variables (https://infastaiii.vercel.app/)

### Required Environment Variables:

```bash
# =============================================
# API CONFIGURATION
# =============================================
VITE_API_URL=https://infastaiii.onrender.com

# =============================================
# OPTIONAL: Firebase Configuration (if used)
# =============================================
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## How to Set Environment Variables in Vercel:

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (infastaiii)
3. Go to "Settings" → "Environment Variables"
4. Add the variables from above

## Build Command:
```bash
npm run build
```

## Development:
```bash
npm run dev
```

## Production URL:
Your production URL: `https://infastaiii.vercel.app/`

## Configuration:
- Backend Render.com URL: `https://infastaiii.onrender.com`
- Frontend Vercel URL: `https://infastaiii.vercel.app/`

Set in Vercel:
```
VITE_API_URL=https://infastaiii.onrender.com
```

And in Render.com backend:
```
FRONTEND_URL=https://infastaiii.vercel.app
```
