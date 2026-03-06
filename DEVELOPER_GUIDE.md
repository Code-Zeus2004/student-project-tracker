# 👨‍💻 Developer Guide

Quick reference for developers working on the Student Project Tracker.

---

## Local Development Setup

### Prerequisites
- Node.js 14+ installed
- MongoDB Atlas account (free)
- Git installed
- Code editor (VS Code recommended)

### Initial Setup (5 minutes)

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd student-project-tracker
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB Atlas connection string
   ```

3. **Start Backend**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:5000`

4. **Open Frontend**
   - Open `index.html` in browser
   - Or use Live Server extension

---

## Project Structure

```
student-project-tracker/
├── Frontend (Static Files)
│   ├── index.html          # Main HTML
│   ├── css/styles.css      # All styles
│   ├── js/
│   │   ├── app.js         # App initialization & events
│   │   ├── data.js        # API & cache management
│   │   ├── ui.js          # UI rendering
│   │   └── utils.js       # Utility functions
│   └── assets/            # Images, icons, etc.
│
└── Backend (Node.js API)
    ├── server.js          # Express server
    ├── models/
    │   └── Project.js     # MongoDB schema
    └── routes/
        └── projects.js    # API endpoints
```

---

## Code Architecture

### Frontend Flow

```
User Action
    ↓
app.js (Event Handler)
    ↓
data.js (API Call)
    ↓
Backend API
    ↓
data.js (Update State)
    ↓
ui.js (Render UI)
    ↓
User Sees Update
```

### Data Flow

```
projectsState (in-memory)
    ↓
localStorage (cache)
    ↓
Backend API
    ↓
MongoDB Atlas
```

---

## Key Files Explained

### js/app.js
- Application initialization
- Event listeners setup
- Form handling
- Notifications
- Theme management

**Key Functions:**
- `initApp()` - Initialize application
- `handleFormSubmit()` - Handle project creation/editing
- `showNotification()` - Display notifications

### js/data.js
- API communication
- State management
- Cache management
- Offline handling

**Key Functions:**
- `loadProjects()` - Fetch from API with cache fallback
- `addProject()` - Create project (online/offline)
- `updateProject()` - Update project (online/offline)
- `deleteProject()` - Delete project (online/offline)
- `saveToCache()` - Save to localStorage
- `loadFromCache()` - Load from localStorage

### js/ui.js
- DOM manipulation
- Project card rendering
- Statistics updates
- Filtering and sorting

**Key Functions:**
- `renderProjects()` - Render project list
- `updateStats()` - Update statistics
- `createProjectCard()` - Generate project HTML

### js/utils.js
- Helper functions
- Date formatting
- Status calculations

**Key Functions:**
- `formatDate()` - Format dates
- `isOverdue()` - Check if project is overdue
- `getStatusText()` - Get status display text

---

## API Endpoints

### GET /api/projects
Get all projects

**Response:**
```json
[
  {
    "_id": "...",
    "title": "Project Title",
    "subject": "Subject",
    "description": "Description",
    "priority": "high",
    "status": "in-progress",
    "deadline": "2024-12-31T00:00:00.000Z",
    "tasks": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /api/projects
Create a project

**Request:**
```json
{
  "title": "New Project",
  "subject": "Math",
  "description": "Description",
  "priority": "medium",
  "status": "not-started",
  "deadline": "2024-12-31",
  "tasks": []
}
```

### PUT /api/projects/:id
Update a project

**Request:** (partial update)
```json
{
  "status": "completed"
}
```

### DELETE /api/projects/:id
Delete a project

---

## State Management

### Global State
```javascript
// In data.js
let projectsState = [];  // In-memory state
let isOfflineMode = false;  // Offline flag
```

### State Updates
1. API call succeeds → Update `projectsState` → Save to cache
2. API call fails → Load from cache → Set offline mode
3. User action → Update state → Try API → Fallback to cache

---

## Offline Mode

### How It Works

1. **On Load:**
   ```javascript
   try {
       projects = await loadProjects();  // Try API
       saveToCache(projects);  // Cache on success
   } catch {
       projects = loadFromCache();  // Fallback to cache
       isOfflineMode = true;
   }
   ```

2. **On Create/Update/Delete:**
   ```javascript
   if (isOfflineMode) {
       // Save to cache with pendingSync flag
       project.pendingSync = true;
       saveToCache(projectsState);
   } else {
       // Try API, fallback to cache
   }
   ```

3. **On Reconnect:**
   ```javascript
   await forceSyncWithBackend();  // Sync pending changes
   ```

---

## Debugging

### Frontend Debug API

Open browser console:

```javascript
// Check connection
await window.debugAPI.checkConnection()
// Returns: true/false

// Get status
await window.debugAPI.getStatus()
// Returns: { url, connected, projectCount, message }

// View projects
window.debugAPI.getProjects()
// Returns: Array of projects

// Cache info
window.debugAPI.getCacheInfo()
// Returns: { hasCachedData, cachedProjectCount, lastSync, isOfflineMode }

// Clear cache
window.debugAPI.clearCache()

// Force sync
await window.debugAPI.forceSync()

// Check offline status
window.debugAPI.isOffline()
```

### Backend Logs

```bash
# In terminal where backend is running
# You'll see:
API Request: GET http://localhost:5000/api/projects
✅ MongoDB Atlas Connected
🚀 Server running on port 5000
```

---

## Common Development Tasks

### Add a New Field to Projects

1. **Update Schema** (backend/models/Project.js):
   ```javascript
   const ProjectSchema = new mongoose.Schema({
       // ... existing fields
       newField: {
           type: String,
           default: ''
       }
   });
   ```

2. **Update Form** (index.html):
   ```html
   <input type="text" id="project-newfield" name="newfield">
   ```

3. **Update Form Handler** (js/app.js):
   ```javascript
   const projectData = {
       // ... existing fields
       newField: formData.get('newfield')
   };
   ```

4. **Update UI** (js/ui.js):
   ```javascript
   function createProjectCard(project) {
       // Add new field to card HTML
   }
   ```

### Add a New API Endpoint

1. **Add Route** (backend/routes/projects.js):
   ```javascript
   router.get('/custom-endpoint', async (req, res) => {
       try {
           // Your logic here
           res.json({ data: 'response' });
       } catch (error) {
           res.status(500).json({ message: error.message });
       }
   });
   ```

2. **Add Frontend Function** (js/data.js):
   ```javascript
   async function customApiCall() {
       return await apiRequest('/projects/custom-endpoint');
   }
   ```

### Add a New Filter

1. **Add UI** (index.html):
   ```html
   <select id="filter-newfield">
       <option value="all">All</option>
       <option value="value1">Value 1</option>
   </select>
   ```

2. **Add Event Listener** (js/app.js):
   ```javascript
   document.getElementById('filter-newfield')
       .addEventListener('change', handleFilterChange);
   ```

3. **Update Filter Logic** (js/data.js):
   ```javascript
   function getFilteredProjects(filters) {
       // ... existing filters
       if (filters.newfield && filters.newfield !== 'all') {
           projects = projects.filter(p => p.newfield === filters.newfield);
       }
       return projects;
   }
   ```

---

## Testing

### Manual Testing

1. **Test Create:**
   - Click + button
   - Fill form
   - Submit
   - Verify project appears

2. **Test Edit:**
   - Click edit button
   - Modify fields
   - Submit
   - Verify changes saved

3. **Test Delete:**
   - Click delete button
   - Confirm
   - Verify project removed

4. **Test Offline:**
   - DevTools → Network → Offline
   - Refresh page
   - Verify cached data loads
   - Try creating project
   - Verify saved locally

### API Testing with curl

```bash
# Get all projects
curl http://localhost:5000/api/projects

# Create project
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","priority":"high","status":"not-started","deadline":"2024-12-31"}'

# Update project
curl -X PUT http://localhost:5000/api/projects/PROJECT_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# Delete project
curl -X DELETE http://localhost:5000/api/projects/PROJECT_ID
```

---

## Git Workflow

### Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ... code ...

# Commit
git add .
git commit -m "feat: add new feature"

# Push
git push origin feature/new-feature

# Create pull request on GitHub
```

### Commit Message Format

```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

Examples:
feat(ui): add project filtering
fix(api): resolve CORS issue
docs(readme): update setup instructions
```

---

## Performance Tips

### Frontend
- Minimize DOM manipulations
- Use event delegation
- Debounce search/filter inputs
- Lazy load images
- Cache DOM queries

### Backend
- Index MongoDB fields
- Use projection in queries
- Implement pagination
- Cache frequent queries
- Use connection pooling

---

## Security Best Practices

### Frontend
- ✅ Escape HTML (already implemented)
- ✅ Validate user input
- ✅ Use HTTPS in production
- ✅ Don't store sensitive data in localStorage

### Backend
- ✅ Validate all inputs
- ✅ Use environment variables for secrets
- ✅ Enable CORS properly
- ✅ Sanitize database queries
- ✅ Use HTTPS in production

---

## Deployment

### Quick Deploy

```bash
# 1. Push to GitHub
git push

# 2. Deploy backend to Render
# (Automatic from GitHub)

# 3. Deploy frontend to Vercel
# (Automatic from GitHub)
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## Troubleshooting

### "Cannot connect to backend"
```bash
# Check if backend is running
curl http://localhost:5000/health

# Check API URL in js/data.js
# Should be: http://localhost:5000/api
```

### "MongoDB connection failed"
```bash
# Check .env file
# Verify MONGO_URI is correct
# Check MongoDB Atlas network access
```

### "CORS error"
```bash
# Check FRONTEND_URL in backend .env
# Should match your frontend URL
```

### "Projects not persisting"
```bash
# Check MongoDB connection
# Check backend logs
# Test API directly with curl
```

---

## Resources

- **MongoDB Docs**: https://docs.mongodb.com/
- **Express Docs**: https://expressjs.com/
- **MDN Web Docs**: https://developer.mozilla.org/
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

## Getting Help

1. Check documentation files
2. Use debug API in console
3. Check backend logs
4. Search GitHub issues
5. Create new issue with details

---

**Happy coding! 🚀**
