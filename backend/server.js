const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/never-have-i-ever';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 10s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(() => {
  console.log('MongoDB connected successfully');
  console.log(`Connected to: ${MONGODB_URI}`);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.error('Please make sure MongoDB is running or check your connection string');
  console.error('To start MongoDB locally, run: mongod');
  console.error('Or use MongoDB Atlas and update MONGODB_URI in .env file');
});

// Middleware to check MongoDB connection
const checkMongoConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: 'Database not connected. Please ensure MongoDB is running.',
      details: 'MongoDB connection state: ' + ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
    });
  }
  next();
};

// Routes (with MongoDB connection check)
app.use('/api/questions', checkMongoConnection, require('./routes/questions'));
app.use('/api/game', checkMongoConnection, require('./routes/game'));
app.use('/api/rooms', checkMongoConnection, require('./routes/rooms'));

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: dbStatus,
    mongodbUri: MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') // Hide credentials
  });
});

// Socket.io connection handling
require('./socket/socketHandler')(io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.io server initialized`);
});

