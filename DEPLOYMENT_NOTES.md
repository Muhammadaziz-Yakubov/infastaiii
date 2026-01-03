# 🚀 Deployment Configuration

## ✅ Production URLs

### Frontend (Primary Domain)
- **Production URL**: `https://www.infastproject.uz`
- **Alternative**: `https://infastproject.uz`
- **Backup (Vercel)**: `https://infastaiii.vercel.app`

### Backend (Render.com)
- **API URL**: `https://infastaiii.onrender.com`

---

## 🔧 Environment Variables

### Backend (Render.com)
```bash
FRONTEND_URL=https://www.infastproject.uz
MONGODB_URI=mongodb+srv://yakubovdev:Azizbek0717@cluster0
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
TELEGRAM_BOT_TOKEN=8584966031:AAH4uri2sVBGXj1mZARHJdNtzeoMpB7hLR8
```

### Frontend (infastproject.uz hosting)
```bash
VITE_API_URL=https://infastaiii.onrender.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 🔐 Google OAuth Configuration

### Google Cloud Console Settings:
1. Go to: https://console.cloud.google.com/
2. Select your project
3. Navigate to: **APIs & Services** → **Credentials**
4. Edit OAuth 2.0 Client ID

### Authorized JavaScript origins:
```
https://www.infastproject.uz
https://infastproject.uz
https://infastaiii.onrender.com
```

### Authorized redirect URIs:
```
https://infastaiii.onrender.com/api/auth/google/callback
https://www.infastproject.uz/auth/callback
https://infastproject.uz/auth/callback
```

---

## 📝 Deployment Checklist

### Backend (Render.com)
- [ ] Set `FRONTEND_URL=https://www.infastproject.uz`
- [ ] Update Google OAuth credentials
- [ ] Verify CORS settings include domain
- [ ] Test API endpoints
- [ ] Check Telegram bot webhook

### Frontend (infastproject.uz)
- [ ] Set `VITE_API_URL=https://infastaiii.onrender.com`
- [ ] Build with: `npm run build`
- [ ] Upload `dist/` folder to hosting
- [ ] Configure domain DNS
- [ ] Test Google OAuth flow
- [ ] Verify all API calls work

### Google Cloud Console
- [ ] Add domain to authorized origins
- [ ] Add callback URLs for domain
- [ ] Test OAuth flow end-to-end

---

## 🐛 Common Issues & Solutions

### Issue: Google OAuth redirects to Vercel instead of domain
**Solution**: 
1. Update `FRONTEND_URL` in Render.com to `https://www.infastproject.uz`
2. Redeploy backend
3. Clear browser cache
4. Test OAuth flow

### Issue: CORS errors
**Solution**: 
1. Verify domain is in `allowedOrigins` array in `server.js`
2. Check `FRONTEND_URL` environment variable
3. Redeploy backend

### Issue: API calls fail
**Solution**: 
1. Verify `VITE_API_URL` is set correctly in frontend
2. Check backend is running on Render.com
3. Test API endpoint directly: `https://infastaiii.onrender.com/api/public/stats`

---

## 🔄 Deployment Steps

### 1. Backend Deployment (Render.com)
```bash
# Update environment variables in Render.com dashboard
FRONTEND_URL=https://www.infastproject.uz

# Render.com will auto-deploy on git push
git push origin main
```

### 2. Frontend Deployment (infastproject.uz)
```bash
# Build production
cd frontend
npm run build

# Upload dist/ folder to hosting via FTP/cPanel
# Or use deployment script if available
```

### 3. Verify Deployment
```bash
# Test backend
curl https://infastaiii.onrender.com/api/public/stats

# Test frontend
# Visit: https://www.infastproject.uz
# Try Google OAuth login
```

---

## 📞 Support

If issues persist:
1. Check Render.com logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Test API endpoints with Postman/curl
