# Backend Setup Guide

## Quick Start

Your backend is configured to run on **port 5000** with MongoDB Atlas (cloud database).

### 1. Install Dependencies (First Time Only)

```bash
cd backend
npm install
```

### 2. Start the Backend Server

```bash
cd backend
npm start
```

You should see:
```
Server running on port 5000
MongoDB Connected
```

### 3. Test the API

Open your browser and visit:
```
http://localhost:5000/api/projects
```

You should see a JSON array of projects (empty array `[]` if no projects exist yet).

## Error: "Failed to load resource: net::ERR_CONNECTION_REFUSED"

This error means your backend server is not running. Follow the Quick Start steps above.

## Your Backend Configuration

- **Port**: 5000
- **Database**: MongoDB Atlas (Cloud)
- **API Base URL**: `http://localhost:5000/api`
- **Frontend API URL**: Already configured in `js/data.js`

## API Endpoints

Your backend provides these endpoints:

### GET /api/projects
Returns all projects as an array
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My Project",
    "description": "Project description",
    "subject": "Computer Science",
    "priority": "high",
    "status": "in-progress",
    "deadline": "2024-12-31",
    "tasks": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /api/projects
Creates a new project and returns the created project
```json
{
  "title": "New Project",
  "description": "Description",
  "subject": "Math",
  "priority": "medium",
  "status": "not-started",
  "deadline": "2024-12-31",
  "tasks": []
}
```

### PUT /api/projects/:id
Updates a project and returns the updated project
```json
{
  "status": "completed"
}
```

### DELETE /api/projects/:id
Deletes a project and returns a success message

## Debugging Tools

The frontend now includes debugging tools. Open browser console and type:

```javascript
// Check backend connection
await window.debugAPI.checkConnection()

// Get backend status
await window.debugAPI.getStatus()

// View current projects in state
window.debugAPI.getProjects()

// View API URL
window.debugAPI.apiUrl
```

## Common Issues

### Issue: CORS Error
**Solution**: Add CORS middleware to your backend:
```javascript
const cors = require('cors');
app.use(cors());
```

### Issue: Wrong Port
**Solution**: Check your backend console for the actual port, then update `js/data.js`

### Issue: MongoDB Not Running
**Solution**: Start MongoDB:
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Issue: 404 on /api/projects
**Solution**: Your backend routes might use a different path. Check if it's:
- `/projects` (without /api)
- `/api/v1/projects`
- Something else

Update `API_BASE_URL` in `js/data.js` accordingly.

## Still Having Issues?

1. Check browser console for detailed error messages
2. Check backend console for errors
3. Verify MongoDB is running and connected
4. Test API endpoints with Postman or curl
5. Make sure frontend and backend are on the same network (if not localhost)
