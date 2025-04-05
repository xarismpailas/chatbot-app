const { generateResponse } = require('../utils/geminiAI');
const { getInfoFromWeb } = require('../utils/webSearch');
const logger = require('../config/logger');

// In-memory storage for conversations (replace with database in production)
const conversations = {};

/**
 * Ελέγχει αν η ερώτηση χρειάζεται αναζήτηση στο διαδίκτυο
 * @param {string} message - Μήνυμα χρήστη
 * @returns {boolean} - True αν χρειάζεται αναζήτηση
 */
function needsWebSearch(message) {
  // Φράσεις που υποδεικνύουν ανάγκη για αναζήτηση στο web
  const searchIndicators = [
    'τι είναι', 'τι είναι το', 'πες μου για', 'πληροφορίες για', 
    'ποιος είναι', 'ποια είναι', 'πότε', 'πού', 'γιατί',
    'ωράριο', 'ώρες λειτουργίας', 'διεύθυνση', 'τηλέφωνο',
    'πρόσφατα νέα', 'τελευταία νέα', 'τιμή', 'κόστος',
    'πώς να', 'οδηγίες για',
    'what is', 'tell me about', 'information about',
    'who is', 'when', 'where', 'why', 'how to',
    'latest news', 'recent news', 'price', 'cost',
    'opening hours', 'address', 'phone'
  ];
  
  const lowercaseMessage = message.toLowerCase();
  
  // Έλεγχος για φράσεις που υποδεικνύουν αναζήτηση
  const hasSearchIndicator = searchIndicators.some(indicator => 
    lowercaseMessage.includes(indicator.toLowerCase())
  );
  
  // Έλεγχος για URLs ή ονόματα domain
  const urlRegex = /\b(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+)(?:\.[a-zA-Z]{2,})+\b/i;
  const containsUrl = urlRegex.test(lowercaseMessage);
  
  // Ελέγχουμε αν η ερώτηση αναφέρεται σε τρέχοντα γεγονότα, νέα, ή επίκαιρα θέματα
  const currentEventsIndicators = [
    'σήμερα', 'χθες', 'τώρα', 'πρόσφατα', 'επίκαιρο', 'επικαιρότητα',
    'today', 'yesterday', 'now', 'recent', 'current', 'latest'
  ];
  
  const hasCurrentEventsIndicator = currentEventsIndicators.some(indicator => 
    lowercaseMessage.includes(indicator.toLowerCase())
  );
  
  // Επιστροφή true αν οποιοδήποτε από τα κριτήρια ικανοποιείται
  return hasSearchIndicator || containsUrl || hasCurrentEventsIndicator;
}

/**
 * @desc    Get all conversations for a user
 * @route   GET /api/chat/conversations
 * @access  Private
 */
exports.getConversations = (req, res) => {
  try {
    const userId = req.user.id;
    const userConversations = Object.values(conversations).filter(
      conv => conv.userId === userId
    );

    res.status(200).json({
      success: true,
      data: userConversations || []
    });
  } catch (error) {
    logger.error(`Error getting conversations: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error retrieving conversations'
    });
  }
};

/**
 * @desc    Get a single conversation
 * @route   GET /api/chat/conversations/:id
 * @access  Private
 */
exports.getConversation = (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;
    
    const conversation = conversations[conversationId];
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    if (conversation.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation'
      });
    }
    
    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    logger.error(`Error getting conversation: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error retrieving conversation'
    });
  }
};

/**
 * @desc    Create a new conversation
 * @route   POST /api/chat/conversations
 * @access  Private
 */
exports.createConversation = (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;
    
    const conversationId = `conv_${Date.now()}`;
    
    const newConversation = {
      id: conversationId,
      userId,
      title: title || 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    conversations[conversationId] = newConversation;
    
    res.status(201).json({
      success: true,
      data: newConversation
    });
  } catch (error) {
    logger.error(`Error creating conversation: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error creating conversation'
    });
  }
};

/**
 * @desc    Send a message in a conversation
 * @route   POST /api/chat/messages
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId, message } = req.body;
    
    if (!conversationId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both conversationId and message'
      });
    }
    
    const conversation = conversations[conversationId];
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    if (conversation.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation'
      });
    }
    
    // Add user message to conversation
    const userMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    conversation.messages.push(userMessage);
    conversation.updatedAt = new Date();
    
    // Format conversation history for the AI
    const history = conversation.messages.slice(0, -1).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    let aiResponse = '';
    
    // Έλεγχος αν η ερώτηση χρειάζεται αναζήτηση στο web
    if (needsWebSearch(message)) {
      logger.info(`Web search triggered for: "${message}"`);
      try {
        // Αναζήτηση στο web
        logger.info(`Starting web search with API key: ${process.env.GOOGLE_SEARCH_API_KEY ? 'Present (first 5 chars: ' + process.env.GOOGLE_SEARCH_API_KEY.substring(0, 5) + '...)' : 'Missing'}`);
        logger.info(`Search Engine ID: ${process.env.GOOGLE_SEARCH_ENGINE_ID ? process.env.GOOGLE_SEARCH_ENGINE_ID : 'Missing'}`);
        
        const webInfo = await getInfoFromWeb(message);
        
        logger.info('Web search results received successfully');
        logger.info(`Results length: ${webInfo.length} characters`);
        
        // Προσθήκη των πληροφοριών από το web στο prompt για τα Gemini AI
        const enhancedPrompt = `Ο χρήστης ρώτησε: "${message}". 
        
Βρήκα τις εξής πληροφορίες από το διαδίκτυο:
${webInfo}

Παρακαλώ χρησιμοποίησε αυτές τις πληροφορίες για να δώσεις μια όσο το δυνατόν πιο ακριβή και χρήσιμη απάντηση στον χρήστη. Μην αναφέρεις ότι σου έδωσα αυτές τις πληροφορίες, αλλά απάντησε σαν να τις γνώριζες ήδη. Μην ξεκινάς την απάντησή σου με "Σύμφωνα με τις πληροφορίες που βρήκα" ή παρόμοιες φράσεις.`;
        
        // Δημιουργία απάντησης με βάση τις πληροφορίες από το web
        logger.info('Sending enhanced prompt to AI');
        aiResponse = await generateResponse(enhancedPrompt, history);
        logger.info('AI response with web search info received');
      } catch (searchError) {
        logger.error(`Web search failed: ${searchError.message}`);
        if (searchError.stack) {
          logger.error(`Error stack: ${searchError.stack}`);
        }
        
        // Λεπτομερής καταγραφή του σφάλματος
        if (searchError.response) {
          logger.error(`Error response status: ${searchError.response.status}`);
          logger.error(`Error response data: ${JSON.stringify(searchError.response.data)}`);
        }
        
        // Fallback σε απλή απάντηση αν αποτύχει η αναζήτηση
        logger.info('Falling back to regular AI response without web search');
        aiResponse = await generateResponse(message, history);
      }
    } else {
      // Κανονική απάντηση από το Gemini AI χωρίς αναζήτηση
      logger.info(`Regular AI response for message: "${message.substring(0, 30)}..."`);
      aiResponse = await generateResponse(message, history);
    }
    
    // Add AI response to conversation
    const botMessage = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };
    
    conversation.messages.push(botMessage);
    conversation.updatedAt = new Date();
    
    res.status(200).json({
      success: true,
      data: {
        userMessage,
        botMessage
      }
    });
  } catch (error) {
    logger.error(`Error sending message: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error processing message'
    });
  }
};