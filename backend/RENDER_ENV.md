# Render.com Environment Variables Setup

## Required Environment Variables:

```bash
# Database
MONGODB_URI=mongodb+srv://yakubovdev:Azizbek0717@cluster0

# Server
PORT=10000
NODE_ENV=production

# Frontend
FRONTEND_URL=https://infastaiii.vercel.app

# Render Specific (Auto-set by Render)
RENDER_EXTERNAL_URL=https://infastaiii.onrender.com
RENDER_SERVICE_NAME=infastaiii

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Email (optional, Gmail)
EMAIL_USER=muhammadazizyaqubov2@gmail.com
EMAIL_PASS=zbpg bznl dviq hjum

# Telegram Bot (Required for phone auth)
TELEGRAM_BOT_TOKEN=8584966031:AAH4uri2sVBGXj1mZARHJdNtzeoMpB7hLR8
TELEGRAM_ADMIN_GROUP_ID=-1003627626456
```

## How to Set in Render.com:

1. Go to your Render service dashboard
2. Click on "Environment"
3. Add each variable from above
4. **Important:** `RENDER_EXTERNAL_URL` is usually auto-set by Render
5. If not set, use: `https://your-service-name.onrender.com`

## Telegram Bot Webhook:

The bot will automatically use webhook in production mode:
- URL: `https://infastaiii.onrender.com/api/auth/telegram/webhook`
- This handles Telegram updates without polling conflicts
