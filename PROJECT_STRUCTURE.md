# 📁 Project Structure

This document explains the organization of the Student Project Tracker monorepo.

## Overview

This is a **monorepo** containing both frontend and backend code in a single repository, optimized for Vercel (frontend) and Render (backend) deployments.

---

## Directory Structure

```
student-project-tracker/
│
├── 🎨 FRONTEND (Root Level - Vercel Deployment)
│   ├── index.html                 # Main HTML entry point
│   ├── vercel.json               # Vercel deployment config
│   ├── .vercelignore             # Files to exclude from Vercel
│   │
│   ├── css/
│   │   └── styles.css            # All application styles
│   │
│   ├── js/
│   │   ├── app.js                # Application initialization & events
│   │   ├── data.js               # API integration & cache management
│   │   ├── ui.js                 # UI rendering & DOM manipulation
│   │   └── utils.js              # Utility functions
│   │
│   └── assets/
│       ├── favicon.svg           # App icon
│       ├── QUICK_SETUP.html      # Favicon generator tool
│       └── README.md             # Assets documentation
│
├── 🔧 BACKEND (Separate Folder - Render Deployment)
│   ├── server.js                 # Express server entry point
│   ├── package.json              # Backend dependencies
│   ├── render.yaml               # Render deployment config
│   ├── .env                      # Environment variables (not in git)
│   ├── .env.example              # Environment template
│   │
│   ├── models/
│   │   └── Project.js            # MongoDB schema
│   │
│   ├── routes/
│   │   └── projects.js           # API endpoints
│   │
│   └── README.md                 # Backend API documentation
│
├── 📚 DOCUMENTATION (Root Level)
│   ├── README.md                 # Main project documentation
│   ├── DEPLOYMENT_GUIDE.md       # Step-by-step deployment
│   ├── PRODUCTION_SETUP.md       # Quick reference
│   ├── DEVELOPER_GUIDE.md        # Developer reference
│   ├── UPGRADE_SUMMARY.md        # What changed in upgrade
│   ├── UPGRADE_CHECKLIST.md      # Verification checklist
│   ├── TESTING_CHECKLIST.md      # Testing guide
│   ├── PROJECT_STRUCTURE.md      # This file
│   ├── FAVICON_SETUP.md          # Favicon documentation
│   ├── START_HERE.md             # Quick start guide
│   ├── FIXES_APPLIED.md          # Bug fixes log
│   └── REVIEW.md                 # Code review notes
│
└── 🔒 CONFIGURATION (Root Level)
    ├── .gitignore                # Git ignore rules
    ├── .vercelignore             # Vercel ignore rules
    └── vercel.json               # Vercel configuration
```

---

## Why This Structure?

### Frontend at Root Level
✅ **Standard for Vercel** - Vercel expects static files at root
✅ **Simple deployment** - No configuration needed
✅ **Fast builds** - Direct access to files
✅ **Easy development** - Just open index.html

### Backend in Separate Folder
✅ **Clear separation** - Backend code isolated
✅ **Independent deployment** - Render deploys only backend/
✅ **Separate dependencies** - Own package.json
✅ **Easy to maintain** - All backend code in one place

### Documentation at Root
✅ **Easy to find** - Visible in repository root
✅ **GitHub displays** - README.md shows on GitHub
✅ **Accessible** - No need to navigate folders

---

## File Responsibilities

### Frontend Files

#### index.html
- Main HTML structure
- Loads CSS and JavaScript
- Contains app layout and forms

#### css/styles.css
- All application styles
- CSS variables for theming
- Responsive design rules
- Animations and transitions

#### js/app.js
- Application initialization
- Event listeners setup
- Form handling
- Notifications
- Theme management

#### js/data.js
- API communication (fetch)
- State management (projectsState)
- localStorage caching
- Offline mode handling
- CRUD operations

#### js/ui.js
- DOM manipulation
- Project card rendering
- Statistics updates
- Filtering and sorting

#### js/utils.js
- Date formatting
- Status calculations
- Helper functions

### Backend Files

#### server.js
- Express server setup
- MongoDB connection
- CORS configuration
- Route mounting
- Error handling

#### models/Project.js
- MongoDB schema definition
- Data validation
- Default values
- Timestamps

#### routes/projects.js
- GET /api/projects - List all
- POST /api/projects - Create
- PUT /api/projects/:id - Update
- DELETE /api/projects/:id - Delete

---

## Data Flow

```
User Action (Browser)
    ↓
index.html
    ↓
js/app.js (Event Handler)
    ↓
js/data.js (API Call)
    ↓
Backend API (server.js → routes/projects.js)
    ↓
MongoDB Atlas (models/Project.js)
    ↓
Response back through chain
    ↓
js/data.js (Update State & Cache)
    ↓
js/ui.js (Render UI)
    ↓
User Sees Update
```

---

## Deployment Structure

### Vercel (Frontend)
```
Deploys: Root level files
- index.html
- css/
- js/
- assets/
- vercel.json

Ignores: backend/ (via .vercelignore)
```

### Render (Backend)
```
Deploys: backend/ folder only
- server.js
- models/
- routes/
- package.json

Root Directory Setting: backend
```

---

## Development Workflow

### Local Development
```bash
# Terminal 1 - Backend
cd backend
npm start
# Runs on http://localhost:5000

# Terminal 2 - Frontend
# Open index.html in browser
# Or use Live Server extension
```

### Production Deployment
```bash
# Push to GitHub
git push

# Automatic deployments:
# - Vercel deploys frontend
# - Render deploys backend
```

---

## Environment Variables

### Frontend (js/data.js)
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://your-backend.onrender.com/api';
```

### Backend (.env)
```
MONGO_URI=mongodb+srv://...
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

---

## Adding New Features

### Frontend Feature
1. Update HTML in `index.html`
2. Add styles in `css/styles.css`
3. Add logic in `js/app.js` or `js/ui.js`
4. Update API calls in `js/data.js` if needed

### Backend Feature
1. Update schema in `backend/models/Project.js`
2. Add routes in `backend/routes/projects.js`
3. Update frontend to use new endpoints

### Full-Stack Feature
1. Backend: Add API endpoint
2. Frontend: Add UI and API call
3. Test locally
4. Push to GitHub
5. Auto-deploys to production

---

## File Sizes

```
Frontend:
- index.html:     ~15 KB
- css/styles.css: ~25 KB
- js/app.js:      ~30 KB
- js/data.js:     ~20 KB
- js/ui.js:       ~15 KB
- js/utils.js:    ~5 KB
Total Frontend:   ~110 KB

Backend:
- server.js:      ~3 KB
- models/:        ~2 KB
- routes/:        ~3 KB
Total Backend:    ~8 KB

Documentation:    ~200 KB
```

---

## Git Workflow

### What's Tracked
✅ All frontend files
✅ All backend files (except .env)
✅ All documentation
✅ Configuration files

### What's Ignored (.gitignore)
❌ node_modules/
❌ .env (secrets)
❌ .DS_Store
❌ *.log

---

## Maintenance

### Update Dependencies
```bash
cd backend
npm update
```

### Check for Issues
```bash
# Frontend: Open browser console
# Backend: Check Render logs
```

### Monitor Performance
- Vercel Analytics
- Render Metrics
- MongoDB Atlas Metrics

---

## Summary

This monorepo structure is **optimized for**:
- ✅ Easy deployment (Vercel + Render)
- ✅ Clear separation (frontend/backend)
- ✅ Simple development (no complex build tools)
- ✅ Good organization (logical grouping)
- ✅ Easy maintenance (everything in one repo)

**No reorganization needed!** The current structure follows best practices for this tech stack.
