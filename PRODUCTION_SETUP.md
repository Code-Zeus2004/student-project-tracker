# 🚀 Production Setup - Quick Reference

## Prerequisites Checklist

- [ ] GitHub account
- [ ] MongoDB Atlas account (free)
- [ ] Render account (free)
- [ ] Vercel account (free)

## Setup Steps (30 minutes)

### 1. MongoDB Atlas (5 min)
```
1. Create cluster at mongodb.com/cloud/atlas
2. Create database user
3. Allow network access (0.0.0.0/0)
4. Copy connection string
```

**Connection String Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/projecttracker?retryWrites=true&w=majority
```

### 2. Push to GitHub (2 min)
```bash
git init
git add .
git commit -m "feat: production-ready full-stack project tracker"
git branch -M main
git remote add origin https://github.com/yourusername/project-tracker.git
git push -u origin main
```

### 3. Deploy Backend to Render (10 min)
```
1. Go to render.com
2. New → Web Service
3. Connect GitHub repo
4. Configure:
   - Root Directory: backend
   - Build: npm install
   - Start: npm start
5. Add Environment Variables:
   - MONGO_URI = (your MongoDB connection string)
   - NODE_ENV = production
   - FRONTEND_URL = (will add after Vercel)
6. Deploy
7. Copy backend URL: https://your-app.onrender.com
```

### 4. Update Frontend API URL (2 min)
Edit `js/data.js` line 10:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://your-app.onrender.com/api'; // ← Update this
```

Commit and push:
```bash
git add js/data.js
git commit -m "chore: update production API URL"
git push
```

### 5. Deploy Frontend to Vercel (5 min)
```
1. Go to vercel.com
2. New Project
3. Import GitHub repo
4. Deploy (no configuration needed)
5. Copy Vercel URL: https://your-app.vercel.app
```

### 6. Update Backend CORS (2 min)
```
1. Go to Render dashboard
2. Your service → Environment
3. Update FRONTEND_URL = https://your-app.vercel.app
4. Save (auto-redeploys)
```

### 7. Test Production (5 min)
```
1. Visit your Vercel URL
2. Open browser console (F12)
3. Run: await window.debugAPI.getStatus()
4. Should show: connected: true
5. Create a test project
6. Refresh page - project should persist
```

## Environment Variables Summary

### Render (Backend)
```
MONGO_URI = mongodb+srv://user:pass@cluster.mongodb.net/projecttracker
NODE_ENV = production
FRONTEND_URL = https://your-app.vercel.app
```

### Vercel (Frontend)
```
No environment variables needed!
API URL is in js/data.js
```

## URLs to Save

| Service | URL | Purpose |
|---------|-----|---------|
| MongoDB Atlas | https://cloud.mongodb.com | Database dashboard |
| Render | https://dashboard.render.com | Backend dashboard |
| Vercel | https://vercel.com/dashboard | Frontend dashboard |
| Your App | https://your-app.vercel.app | Live application |
| Your API | https://your-app.onrender.com | Backend API |

## Testing Commands

### Test Backend
```bash
# Health check
curl https://your-app.onrender.com/health

# Get projects
curl https://your-app.onrender.com/api/projects
```

### Test Frontend
Open browser console on your Vercel site:
```javascript
// Connection status
await window.debugAPI.getStatus()

// View projects
window.debugAPI.getProjects()

// Cache info
window.debugAPI.getCacheInfo()
```

## Common Issues & Fixes

### "Cannot connect to backend"
```
✓ Check Render service is running (not sleeping)
✓ Verify API URL in js/data.js
✓ Check FRONTEND_URL in Render matches Vercel URL
```

### "CORS error"
```
✓ Update FRONTEND_URL in Render
✓ Include https:// and no trailing slash
✓ Redeploy backend
```

### "MongoDB connection failed"
```
✓ Check MONGO_URI in Render
✓ Verify MongoDB Network Access (0.0.0.0/0)
✓ Check database user credentials
```

### "Render service sleeping"
```
✓ Free tier sleeps after 15 min inactivity
✓ First request takes 30-60 seconds
✓ Consider UptimeRobot to keep it awake
```

## Automatic Deployments

Both services auto-deploy on git push:

```bash
# Make changes
git add .
git commit -m "feat: new feature"
git push

# Vercel and Render deploy automatically!
```

## Monitoring

### Check Health
- Backend: `https://your-app.onrender.com/health`
- Frontend: Open app and check console

### View Logs
- **Render**: Dashboard → Service → Logs
- **Vercel**: Dashboard → Project → Deployments → Logs

## Cost

| Service | Free Tier | Limits |
|---------|-----------|--------|
| MongoDB Atlas | ✅ | 512 MB storage |
| Render | ✅ | 750 hrs/month, sleeps after 15 min |
| Vercel | ✅ | 100 GB bandwidth |

**Total: $0/month**

## Next Steps

1. ✅ Deploy to production
2. ✅ Test all features
3. 📱 Share your app URL
4. 🎨 Add custom domain (optional)
5. 📊 Add analytics (optional)
6. 🔄 Monitor and maintain

## Support

- Full guide: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Backend docs: [backend/README.md](backend/README.md)
- Main README: [README.md](README.md)

---

**Ready to deploy? Follow the steps above! 🚀**
