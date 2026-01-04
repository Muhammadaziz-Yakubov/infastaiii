# 🚀 InFast AI - Full Production Deployment Guide

## 📋 Overview
This guide will help you deploy both backend (Render.com) and frontend (Vercel) to production.

---

## 🔧 Backend Setup (Render.com)

### 1. Environment Variables
Set these in Render.com → Your Service → Environment:

```bash
# Database
MONGODB_URI=mongodb+srv://yakubovdev:Azizbek0717@cluster0

# Server
PORT=10000
NODE_ENV=production

# Frontend URL (update after Vercel deployment)
FRONTEND_URL=https://your-vercel-app.vercel.app

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Google OAuth (if used)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (if used)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# Telegram Bot (for payments)
TELEGRAM_BOT_TOKEN=8478063592:AAFifIkLftx_ZtKjUiceQ6ictAdgAX2x7hA
TELEGRAM_ADMIN_GROUP_ID=-1003627626456
```

### 2. Build & Deploy
- **Build Command:** `npm install` (Render handles this automatically)
- **Start Command:** `npm start` (automatically uses production mode)

### 3. Check Logs
After deployment, check Render.com logs to ensure:
- ✅ MongoDB connected successfully
- ✅ Server started on port 10000
- ✅ All services initialized

---

## 🎨 Frontend Setup (infastproject.uz)

### 1. Environment Variables
Set these in your hosting provider (infastproject.uz):

```bash
VITE_API_URL=https://infast-backend.onrender.com
```

### 2. Build Settings
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### 3. Deploy
Upload the built files to your infastproject.uz hosting provider.

---

## 🔗 Connecting Frontend & Backend

### Step 1: Deploy Backend First
1. Create Render.com service
2. Set environment variables (use placeholder for FRONTEND_URL)
3. Deploy and get the URL: `https://infastaiii.onrender.com`

### Step 2: Deploy Frontend
1. Set `VITE_API_URL=https://infastaiii.onrender.com` in Vercel
2. Deploy and get the URL: `https://infastaiii.vercel.app/`

### Step 3: Update Backend
1. Set `FRONTEND_URL=https://infastaiii.vercel.app` in Render.com
2. Redeploy backend

---

## ✅ Testing Production Deployment

### 1. Health Check
```bash
curl https://your-render-service.onrender.com/
```

### 2. API Test
```bash
curl https://your-render-service.onrender.com/api/auth/health
```

### 3. Frontend Test
- Visit `https://your-app.vercel.app`
- Check browser console for API connection errors
- Test login/register functionality

### 4. Payment System Test
- Go to Pricing page
- Test Pro plan purchase
- Check Telegram bot notifications

---

## 🔒 Security Checklist

- [ ] All sensitive data in environment variables (not in code)
- [ ] CORS properly configured for production domains
- [ ] Rate limiting active (not bypassed in production)
- [ ] JWT secrets are strong and unique
- [ ] Database user has minimal required permissions
- [ ] Telegram bot token is secure
- [ ] Firebase credentials are properly configured

---

## 🐛 Troubleshooting

### Backend Issues:
- **MongoDB Connection Failed**: Check whitelist IPs in Atlas
- **CORS Errors**: Verify FRONTEND_URL is set correctly
- **Port Issues**: Render uses dynamic ports, use PORT env var

### Frontend Issues:
- **API Connection Failed**: Check VITE_API_URL in Vercel
- **Build Errors**: Ensure all dependencies are in package.json
- **CORS Errors**: Backend CORS config must allow Vercel domain

### Payment Issues:
- **Telegram Bot Not Working**: Check bot token and chat ID
- **File Upload Failed**: Ensure uploads directory is writable

---

## 📈 Monitoring & Maintenance

### Logs:
- **Render.com**: Service logs show backend activity
- **Vercel**: Deployment logs and runtime logs
- **MongoDB Atlas**: Monitor connection counts and performance

### Updates:
- Update environment variables as needed
- Redeploy services after code changes
- Monitor error rates and performance

---

## 🎯 URLs Summary

After deployment, you should have:

- **Backend API**: `https://infastaiii.onrender.com`
- **Frontend App**: `https://infastaiii.vercel.app/`
- **Database**: `mongodb+srv://yakubovdev:Azizbek0717@cluster0`

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review service logs
3. Test environment variables
4. Verify network connectivity

Happy deploying! 🚀✨
