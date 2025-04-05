const express = require('express');
const router = express.Router();
const { protect, verifySubscription } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// Protected routes - require authentication
router.use(protect);

// Get all user conversations
router.get('/conversations', chatController.getConversations);

// Get single conversation
router.get('/conversations/:id', chatController.getConversation);

// Create new conversation
router.post('/conversations', chatController.createConversation);

// Send message - requires active subscription
router.post('/messages', verifySubscription, chatController.sendMessage);

module.exports = router; 