# 📚 Student Project Tracker

A modern, full-stack web application for managing student projects with offline support and cloud synchronization.

![Architecture](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)
![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)
![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb)
![Cache](https://img.shields.io/badge/Cache-localStorage-orange)

## ✨ Features

### Core Functionality
- ✅ Create, edit, and delete projects
- ✅ Track project status (Not Started, In Progress, Completed)
- ✅ Set priority levels (Low, Medium, High)
- ✅ Manage deadlines with overdue detection
- ✅ Add and track sub-tasks within projects
- ✅ Real-time statistics and progress tracking
- ✅ Filter and sort projects
- ✅ Responsive design (mobile, tablet, desktop)

### Advanced Features
- 🤖 AI-powered project description generator
- 🎨 Beautiful gradient UI with animations
- 🌓 Light/Dark theme toggle
- 💾 Offline mode with localStorage cache
- 🔄 Automatic sync when connection restored
- 📊 Circular progress ring visualization
- 🎯 Smart filtering and sorting

### Technical Features
- ⚡ Fast, modern vanilla JavaScript
- 🔒 Secure MongoDB Atlas storage
- 🌐 RESTful API architecture
- 📱 Progressive Web App ready
- 🎭 Graceful offline fallback
- 🚀 Production-ready deployment

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Frontend (Vercel)                              │   │
│  │  • HTML/CSS/JavaScript                          │   │
│  │  • Responsive UI                                │   │
│  │  • localStorage Cache                           │   │
│  └──────────────────┬──────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────┘
                      │
                      │ HTTPS API Calls
                      │ (fetch)
                      │
┌─────────────────────▼──────────────────────────────────┐
│  Backend API (Render)                                  │
│  • Node.js + Express                                   │
│  • RESTful endpoints                                   │
│  • CORS enabled                                        │
│  • Error handling                                      │
└──────────────────────┬─────────────────────────────────┘
                       │
                       │ MongoDB Driver
                       │ (mongoose)
                       │
┌──────────────────────▼─────────────────────────────────┐
│  Database (MongoDB Atlas)                              │
│  • Cloud-hosted                                        │
│  • Automatic backups                                   │
│  • Scalable storage                                    │
└────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/student-project-tracker.git
   cd student-project-tracker
   ```

2. **Set up MongoDB Atlas**
   - Create account at https://mongodb.com/cloud/atlas
   - Create a cluster
   - Get connection string

3. **Configure Backend**
   ```bash
   cd backend
   npm install
   ```
   
   Create `.env` file:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/projecttracker
   PORT=5000
   NODE_ENV=development
   ```

4. **Start Backend**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:5000`

5. **Open Frontend**
   - Open `index.html` in your browser
   - Or use Live Server extension in VS Code

### Production Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete deployment instructions.

**Quick Deploy:**
1. Deploy backend to Render
2. Deploy frontend to Vercel
3. Update API URL in `js/data.js`
4. Done! 🎉

## 📁 Project Structure

```
student-project-tracker/
├── index.html              # Main HTML file
├── vercel.json            # Vercel configuration
├── README.md              # This file
├── DEPLOYMENT_GUIDE.md    # Deployment instructions
│
├── css/
│   └── styles.css         # All styles
│
├── js/
│   ├── app.js            # Main application logic
│   ├── data.js           # API & cache management
│   ├── ui.js             # UI rendering
│   └── utils.js          # Utility functions
│
├── assets/
│   ├── favicon.svg       # App icon
│   └── ...               # Other assets
│
└── backend/
    ├── server.js         # Express server
    ├── package.json      # Dependencies
    ├── .env              # Environment variables (not in git)
    ├── .env.example      # Environment template
    ├── render.yaml       # Render configuration
    ├── README.md         # Backend documentation
    │
    ├── models/
    │   └── Project.js    # MongoDB schema
    │
    └── routes/
        └── projects.js   # API endpoints
```

## 🔌 API Endpoints

### Base URL
- **Local**: `http://localhost:5000/api`
- **Production**: `https://your-app.onrender.com/api`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Detailed health status |
| GET | `/api/projects` | Get all projects |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

See [backend/README.md](backend/README.md) for detailed API documentation.

## 💾 Offline Mode

The app automatically handles offline scenarios:

1. **On Load**: Tries to fetch from API
2. **If Offline**: Loads from localStorage cache
3. **User Actions**: Saved locally with `pendingSync` flag
4. **When Online**: Automatically syncs pending changes

### Testing Offline Mode

1. Open DevTools (F12)
2. Go to Network tab
3. Set throttling to "Offline"
4. Refresh page
5. App still works with cached data!

## 🎨 Features Showcase

### AI Description Generator
- Analyzes project title
- Infers academic domain
- Generates contextual descriptions
- Supports 15+ domains (Math, Physics, CS, Literature, etc.)

### Smart Caching
- Automatic cache on successful API calls
- Fallback to cache when offline
- Pending sync indicators
- Manual sync option

### Statistics Dashboard
- Total projects count
- Status breakdown
- Overdue detection
- Circular progress visualization

### Filtering & Sorting
- Filter by status
- Filter by priority
- Sort by deadline, title, priority, or creation date
- Real-time updates

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- localStorage API
- Fetch API

### Backend
- Node.js
- Express.js
- Mongoose (MongoDB ODM)
- CORS
- dotenv

### Database
- MongoDB Atlas

### Deployment
- Vercel (Frontend)
- Render (Backend)

## 📊 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 80+ | ✅ Full |
| Firefox | 75+ | ✅ Full |
| Safari | 13+ | ✅ Full |
| Edge | 80+ | ✅ Full |
| Mobile Safari | 13+ | ✅ Full |
| Chrome Mobile | 80+ | ✅ Full |

## 🐛 Debugging

### Frontend Debug API

Open browser console and use:

```javascript
// Check backend connection
await window.debugAPI.checkConnection()

// Get backend status
await window.debugAPI.getStatus()

// View cached projects
window.debugAPI.getCacheInfo()

// Force sync with backend
await window.debugAPI.forceSync()

// View all projects in state
window.debugAPI.getProjects()

// Check if offline
window.debugAPI.isOffline()
```

### Backend Logs

**Render:**
- Dashboard → Your Service → Logs tab

**Local:**
- Check terminal where `npm start` is running

## 📝 Environment Variables

### Backend (.env)

```bash
# Required
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/projecttracker

# Optional
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend

No environment variables needed! API URL is configured in `js/data.js`:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://your-app.onrender.com/api';
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Create project
- [ ] Edit project
- [ ] Delete project
- [ ] Change status
- [ ] Change priority
- [ ] Add tasks
- [ ] Filter projects
- [ ] Sort projects
- [ ] Generate AI description
- [ ] Toggle theme
- [ ] Test offline mode
- [ ] Test sync after offline

See [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) for comprehensive testing guide.

## 📈 Performance

- **First Load**: < 2 seconds
- **API Response**: < 500ms
- **Offline Load**: < 100ms (from cache)
- **Bundle Size**: < 100KB (uncompressed)

## 🔒 Security

- ✅ CORS configured
- ✅ Environment variables for secrets
- ✅ MongoDB Atlas network security
- ✅ Input validation
- ✅ XSS protection (HTML escaping)
- ✅ HTTPS in production

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning or production!

## 🙏 Acknowledgments

- MongoDB Atlas for free database hosting
- Render for free backend hosting
- Vercel for free frontend hosting
- All open-source contributors

## 📞 Support

- **Issues**: Create an issue on GitHub
- **Documentation**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Backend API**: See [backend/README.md](backend/README.md)

## 🎯 Roadmap

- [ ] User authentication
- [ ] Project sharing/collaboration
- [ ] File attachments
- [ ] Calendar view
- [ ] Email notifications
- [ ] Export to PDF
- [ ] Mobile app (React Native)
- [ ] Real-time sync (WebSockets)

---

**Made with ❤️ for students everywhere**

🌟 Star this repo if you find it helpful!
