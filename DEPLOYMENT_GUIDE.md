# 🚀 Production Deployment Guide

This guide will help you deploy your Student Project Tracker to production using:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

---

## Architecture Overview

```
┌─────────────────┐
│  Vercel         │
│  (Frontend)     │
│  index.html     │
│  js/*, css/*    │
└────────┬────────┘
         │
         │ HTTPS API Calls
         │
┌────────▼────────┐
│  Render         │
│  (Backend API)  │
│  Node.js +      │
│  Express        │
└────────┬────────┘
         │
         │ MongoDB Driver
         │
┌────────▼────────┐
│  MongoDB Atlas  │
│  (Database)     │
│  Cloud Database │
└─────────────────┘

┌─────────────────┐
│  localStorage   │
│  (Local Cache)  │
│  Offline Mode   │
└─────────────────┘
```

---

## Part 1: MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new cluster (Free tier M0 is sufficient)
4. Wait for cluster to be created (2-3 minutes)

### Step 2: Configure Database Access

1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `projecttracker_user` (or your choice)
5. Password: Generate a secure password (save it!)
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### Step 3: Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
   - This is needed for Render to connect
4. Click **Confirm**

### Step 4: Get Connection String

1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your credentials
7. Add database name after `.net/`: 
   ```
   mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/projecttracker?retryWrites=true&w=majority
   ```

**Save this connection string! You'll need it for Render.**

---

## Part 2: Backend Deployment (Render)

### Step 1: Prepare Backend for Deployment

1. Make sure your `backend/.env` file has the MongoDB Atlas connection string:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/projecttracker?retryWrites=true&w=majority
   PORT=5000
   NODE_ENV=production
   ```

2. Verify `backend/package.json` has a start script:
   ```json
   {
     "scripts": {
       "start": "node server.js"
     }
   }
   ```

### Step 2: Push Code to GitHub

1. Create a new GitHub repository
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "feat: production-ready full-stack project tracker"
   git branch -M main
   git remote add origin https://github.com/yourusername/project-tracker.git
   git push -u origin main
   ```

### Step 3: Deploy to Render

1. Go to https://render.com and sign up
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `student-project-tracker-api`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. Add Environment Variables:
   - Click **Advanced** → **Add Environment Variable**
   - Add these variables:
     ```
     MONGO_URI = mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/projecttracker?retryWrites=true&w=majority
     NODE_ENV = production
     FRONTEND_URL = https://your-vercel-app.vercel.app
     ```
   - (You'll update FRONTEND_URL after deploying frontend)

6. Click **Create Web Service**
7. Wait for deployment (5-10 minutes)
8. Once deployed, copy your backend URL:
   ```
   https://student-project-tracker-api.onrender.com
   ```

### Step 4: Test Backend

Visit your backend URL in browser:
```
https://student-project-tracker-api.onrender.com
```

You should see:
```json
{
  "status": "API Running",
  "message": "Student Project Tracker API",
  "version": "1.0.0"
}
```

Test the projects endpoint:
```
https://student-project-tracker-api.onrender.com/api/projects
```

Should return: `[]` (empty array)

---

## Part 3: Frontend Deployment (Vercel)

### Step 1: Update Frontend API URL

1. Open `js/data.js`
2. Find this line (around line 10):
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' 
       ? 'http://localhost:5000/api'
       : 'https://your-render-backend-url.onrender.com/api';
   ```

3. Replace with your actual Render URL:
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' 
       ? 'http://localhost:5000/api'
       : 'https://student-project-tracker-api.onrender.com/api';
   ```

4. Commit and push:
   ```bash
   git add js/data.js
   git commit -m "chore: update production API URL"
   git push
   ```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com and sign up
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
5. Click **Deploy**
6. Wait for deployment (1-2 minutes)
7. Copy your Vercel URL:
   ```
   https://your-project-name.vercel.app
   ```

### Step 3: Update Backend CORS

1. Go back to Render dashboard
2. Open your backend service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` variable:
   ```
   FRONTEND_URL = https://your-project-name.vercel.app
   ```
5. Click **Save Changes**
6. Service will automatically redeploy

---

## Part 4: Testing Production Deployment

### Test Checklist

1. **Visit your Vercel URL**
   - App should load without errors
   - Check browser console (F12) for errors

2. **Test API Connection**
   - Open browser console
   - Run: `await window.debugAPI.getStatus()`
   - Should show: `connected: true`

3. **Create a Project**
   - Click the + button
   - Fill in project details
   - Click "Add Project"
   - Project should appear in the list

4. **Refresh the Page**
   - Project should still be there (loaded from MongoDB)

5. **Test Offline Mode**
   - Open DevTools → Network tab
   - Set to "Offline"
   - Refresh the page
   - Should show cached projects with warning message

6. **Test All Features**
   - Edit project
   - Delete project
   - Change status
   - Filter projects
   - Sort projects
   - Generate AI descriptions

---

## Part 5: Environment Variables Summary

### Backend (Render)
```
MONGO_URI = mongodb+srv://user:pass@cluster.mongodb.net/projecttracker
NODE_ENV = production
FRONTEND_URL = https://your-app.vercel.app
PORT = (automatically set by Render)
```

### Frontend (Vercel)
No environment variables needed! API URL is configured in `js/data.js`.

---

## Troubleshooting

### Issue: "Cannot connect to backend"

**Solution:**
1. Check Render service is running (not sleeping)
2. Verify API URL in `js/data.js` is correct
3. Check browser console for CORS errors
4. Verify `FRONTEND_URL` in Render matches your Vercel URL

### Issue: "MongoDB connection failed"

**Solution:**
1. Verify `MONGO_URI` in Render environment variables
2. Check MongoDB Atlas Network Access allows 0.0.0.0/0
3. Verify database user credentials are correct
4. Check Render logs for specific error

### Issue: "CORS policy error"

**Solution:**
1. Update `FRONTEND_URL` in Render to match your Vercel URL
2. Make sure it includes `https://` and no trailing slash
3. Redeploy backend after changing environment variables

### Issue: "Render service keeps sleeping"

**Solution:**
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Consider upgrading to paid tier for always-on service
- Or use a service like UptimeRobot to ping your API every 10 minutes

### Issue: "Projects not persisting"

**Solution:**
1. Check MongoDB Atlas connection in Render logs
2. Verify database name in connection string
3. Test API endpoints directly:
   ```
   curl https://your-api.onrender.com/api/projects
   ```

---

## Monitoring & Maintenance

### Check Backend Health

Visit: `https://your-api.onrender.com/health`

Should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### View Logs

**Render:**
- Go to your service dashboard
- Click **Logs** tab
- View real-time logs

**Vercel:**
- Go to your project dashboard
- Click **Deployments**
- Click on a deployment → **View Function Logs**

### Debug API in Production

Open browser console on your Vercel site:

```javascript
// Check connection
await window.debugAPI.checkConnection()

// Get status
await window.debugAPI.getStatus()

// View cached data
window.debugAPI.getCacheInfo()

// Force sync
await window.debugAPI.forceSync()

// View all projects
window.debugAPI.getProjects()
```

---

## Cost Breakdown

| Service | Free Tier | Limits |
|---------|-----------|--------|
| MongoDB Atlas | ✅ Yes | 512 MB storage, Shared CPU |
| Render | ✅ Yes | 750 hours/month, Sleeps after 15 min |
| Vercel | ✅ Yes | 100 GB bandwidth, Unlimited projects |

**Total Cost: $0/month** (with free tiers)

---

## Upgrade to Paid Plans (Optional)

### When to Upgrade:

- **MongoDB Atlas**: When you exceed 512 MB storage
- **Render**: When you need always-on service (no sleeping)
- **Vercel**: When you exceed bandwidth limits

### Recommended Paid Plans:

- **MongoDB Atlas M10**: $0.08/hour (~$57/month)
- **Render Starter**: $7/month (always-on, 512 MB RAM)
- **Vercel Pro**: $20/month (higher limits)

---

## Next Steps

1. ✅ Deploy to production
2. ✅ Test all features
3. 📱 Share your app URL with users
4. 📊 Monitor usage and performance
5. 🔄 Set up automatic deployments (already configured!)
6. 🎨 Customize domain (optional)
7. 📈 Add analytics (optional)

---

## Custom Domain (Optional)

### Vercel:
1. Go to project settings
2. Click **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions

### Render:
1. Go to service settings
2. Click **Custom Domains**
3. Add your domain
4. Update DNS records

---

## Automatic Deployments

Both Vercel and Render automatically deploy when you push to GitHub!

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push

# Vercel and Render will automatically deploy!
```

---

## Support & Resources

- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Project Issues**: Create an issue on GitHub

---

**Congratulations! Your Student Project Tracker is now live in production! 🎉**
