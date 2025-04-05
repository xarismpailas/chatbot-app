// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const winston = require('winston');

// Routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const subscriptionRoutes = require('./routes/subscription');
const knowledgeBaseRoutes = require('./routes/knowledgeBase');
const analyticsRoutes = require('./routes/analytics');
const supportRoutes = require('./routes/support');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    methods: ['GET', 'POST']
  }
});

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001'
}));
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/knowledge-base', knowledgeBaseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/support', supportRoutes);

// WebSocket connection for real-time chat
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join', (userId) => {
    socket.join(userId);
    logger.info(`User ${userId} joined their room`);
  });
  
  socket.on('message', (data) => {
    // Process and store the message
    // Forward to chatbot processing service
    // Return response to the client
    io.to(data.userId).emit('message', data);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Database connection
// Temporary in-memory storage
// This is now commented out as we're using MongoDB
/*
const inMemoryDB = {
  users: [],
  findUser: function(email) {
    return this.users.find(user => user.email === email);
  },
  findUserById: function(id) {
    return this.users.find(user => user._id === id);
  },
  addUser: function(user) {
    // Generate a simple ID
    user._id = `user_${Date.now()}`;
    this.users.push(user);
    return user;
  }
};
*/

// Uncomment MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatbot-saas', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => logger.info('Connected to MongoDB'))
.catch(err => logger.error('MongoDB connection error:', err));

// Log that we're using MongoDB
logger.info('Using MongoDB for data storage');

// Use original auth controller (restore original functionality)
const authController = require('./controllers/authController');

// Original auth middleware
const authMiddleware = require('./middleware/auth');

// Add direct routes for testing authentication
app.post('/api/direct/register', (req, res) => {
  try {
    const { username, email, password, firstName, lastName, company } = req.body;
    
    logger.info(`Direct registration attempt: ${email}, ${username}`);
    
    // Create token manually
    const token = 'test_token_' + Date.now();
    
    // Return success
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        _id: 'user_' + Date.now(),
        username,
        email,
        firstName,
        lastName,
        company,
        subscription: {
          plan: 'free',
          status: 'active',
          messageLimit: 100,
          messagesUsed: 0
        }
      }
    });
    
  } catch (error) {
    logger.error(`Direct registration error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

app.post('/api/direct/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    logger.info(`Direct login attempt: ${email}`);
    
    // Create token manually
    const token = 'test_token_' + Date.now();
    
    // Return success
    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: 'user_' + Date.now(),
        username: email.split('@')[0],
        email: email,
        firstName: 'Test',
        lastName: 'User',
        subscription: {
          plan: 'free',
          status: 'active',
          messageLimit: 100,
          messagesUsed: 0
        }
      }
    });
    
  } catch (error) {
    logger.error(`Direct login error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

app.get('/api/direct/me', (req, res) => {
  // Simple test endpoint that always returns a dummy user
  res.status(200).json({
    success: true,
    user: {
      _id: 'test_user_id',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      subscription: {
        plan: 'free',
        status: 'active'
      }
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 