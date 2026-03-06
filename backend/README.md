# Student Project Tracker - Backend API

Node.js + Express + MongoDB backend for the Student Project Tracker application.

## Features

- RESTful API for project management
- MongoDB Atlas integration
- CORS enabled for frontend access
- Error handling and validation
- Health check endpoints

## API Endpoints

### Base URL
- **Local**: `http://localhost:5000/api`
- **Production**: `https://your-app.onrender.com/api`

### Endpoints

#### GET /
Health check - Returns API status

#### GET /health
Detailed health check with database status

#### GET /api/projects
Get all projects (sorted by creation date, newest first)

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Project Title",
    "subject": "Computer Science",
    "description": "Project description",
    "priority": "high",
    "status": "in-progress",
    "deadline": "2024-12-31T00:00:00.000Z",
    "tasks": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /api/projects
Create a new project

**Request Body:**
```json
{
  "title": "New Project",
  "subject": "Math",
  "description": "Description here",
  "priority": "medium",
  "status": "not-started",
  "deadline": "2024-12-31",
  "tasks": []
}
```

**Response:** Created project object

#### PUT /api/projects/:id
Update a project

**Request Body:** (partial update supported)
```json
{
  "status": "completed",
  "priority": "high"
}
```

**Response:** Updated project object

#### DELETE /api/projects/:id
Delete a project

**Response:**
```json
{
  "message": "Project deleted successfully",
  "id": "507f1f77bcf86cd799439011"
}
```

## Local Development

### Prerequisites
- Node.js 14+ installed
- MongoDB Atlas account (or local MongoDB)

### Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create `.env` file:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/projecttracker
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Server runs on `http://localhost:5000`

### Testing

Test the API with curl:

```bash
# Health check
curl http://localhost:5000/health

# Get all projects
curl http://localhost:5000/api/projects

# Create a project
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Project",
    "subject": "Testing",
    "description": "Test description",
    "priority": "medium",
    "status": "not-started",
    "deadline": "2024-12-31"
  }'
```

## Project Schema

```javascript
{
  title: String (required),
  subject: String,
  description: String,
  priority: String (enum: 'low', 'medium', 'high'),
  status: String (enum: 'not-started', 'in-progress', 'completed'),
  deadline: Date (required),
  tasks: Array of {
    id: String,
    text: String,
    completed: Boolean
  },
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| MONGO_URI | MongoDB connection string | Yes |
| PORT | Server port (default: 5000) | No |
| NODE_ENV | Environment (development/production) | No |
| FRONTEND_URL | Frontend URL for CORS | No |

## Deployment

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy to Render

1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables
4. Deploy!

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Server Error

Error response format:
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

## CORS Configuration

CORS is configured to accept requests from:
- `FRONTEND_URL` environment variable
- All origins (`*`) if FRONTEND_URL is not set (development only)

## Database Connection

- Automatic reconnection on connection loss
- Connection error logging
- Graceful shutdown handling

## Logging

Server logs include:
- API requests (method + URL)
- Database connection status
- Errors and warnings
- Server startup information

## Dependencies

```json
{
  "express": "^5.2.1",
  "mongoose": "^9.2.2",
  "cors": "^2.8.6",
  "dotenv": "^17.3.1"
}
```

## License

MIT
