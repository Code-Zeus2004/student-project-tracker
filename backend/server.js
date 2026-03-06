const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const projectRoutes = require("./routes/projects");
const app = express();

// CORS Configuration for production
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*', // Allow frontend URL from env or all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
    res.json({ 
        status: "API Running",
        message: "Student Project Tracker API",
        version: "1.0.0",
        endpoints: {
            projects: "/api/projects",
            health: "/health"
        }
    });
});

app.get("/health", (req, res) => {
    res.json({ 
        status: "healthy",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use("/api/projects", projectRoutes);

// MongoDB Connection with better error handling
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ MongoDB Atlas Connected");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1);
    }
};

connectDB();

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Use PORT from environment variable (Render provides this)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

