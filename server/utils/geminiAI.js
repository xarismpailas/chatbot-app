const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../config/logger');

// Initialize the Gemini API with the API key from environment variables
const geminiApiKey = process.env.GEMINI_API_KEY;
logger.info(`Using Gemini API Key: ${geminiApiKey ? geminiApiKey.substring(0, 5) + '...' : 'undefined'}`);

// Create the API client
const genAI = new GoogleGenerativeAI(geminiApiKey);

/**
 * Generate a response from Gemini AI
 * @param {string} prompt - The user's message
 * @param {array} history - Conversation history
 * @returns {Promise<string>} - The AI's response
 */
const generateResponse = async (prompt, history = []) => {
  try {
    logger.info(`Generating response for prompt: ${prompt.substring(0, 50)}...`);
    
    // Using gemini-1.5-pro model - confirmed working in our tests
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    logger.info('Using model: gemini-1.5-pro');
    
    // Format history for Gemini
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    logger.info(`Starting chat with history of ${formattedHistory.length} messages`);
    
    // Start a chat session
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });
    
    // Generate the response
    logger.info('Sending message to Gemini API...');
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = response.text();
    
    logger.info(`Response generated successfully (${text.length} chars)`);
    
    return text;
  } catch (error) {
    logger.error(`Error generating AI response: ${error.message}`);
    
    // For a more detailed error message in logs
    if (error.stack) {
      logger.error(`Error stack: ${error.stack}`);
    }
    
    // Fallback to generateContent if chat fails
    try {
      logger.info('Attempting fallback to direct generateContent...');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      logger.info(`Fallback response generated successfully (${text.length} chars)`);
      return text;
    } catch (fallbackError) {
      logger.error(`Fallback also failed: ${fallbackError.message}`);
      return "Συγγνώμη, συνέβη ένα σφάλμα κατά την επεξεργασία του αιτήματός σου. Παρακαλώ δοκίμασε ξανά αργότερα.";
    }
  }
};

module.exports = {
  generateResponse
}; 