const axios = require('axios');
const logger = require('../config/logger');

// Για να χρησιμοποιήσεις το Google Custom Search API χρειάζεσαι:
// 1. Ένα API key από το Google Cloud Console
// 2. Ένα Custom Search Engine ID (cx) από το https://cse.google.com/cse/all
// Αυτά θα τα προσθέσουμε στο .env αρχείο

/**
 * Πραγματοποιεί αναζήτηση στο Google χρησιμοποιώντας το Custom Search API
 * @param {string} query - Ερώτημα αναζήτησης
 * @param {number} numResults - Αριθμός αποτελεσμάτων (max 10)
 * @returns {Promise<Array>} - Πίνακας με αποτελέσματα αναζήτησης
 */
async function searchGoogle(query, numResults = 5) {
  try {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    if (!apiKey || !searchEngineId) {
      logger.error('Missing Google Search API credentials');
      return { error: 'Google Search API credentials not configured' };
    }
    
    logger.info(`Performing web search for: "${query}"`);
    
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx: searchEngineId,
        q: query,
        num: numResults
      }
    });
    
    if (response.data && response.data.items) {
      // Επεξεργασία των αποτελεσμάτων για απλοποιημένη μορφή
      const results = response.data.items.map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink
      }));
      
      logger.info(`Found ${results.length} results for query: "${query}"`);
      return results;
    } else {
      logger.warn(`No results found for query: "${query}"`);
      return [];
    }
  } catch (error) {
    logger.error(`Error searching Google: ${error.message}`);
    
    // Fallback για περίπτωση που το API είναι εκτός λειτουργίας
    if (error.response && error.response.status === 403) {
      return { error: 'Google API quota exceeded or invalid credentials' };
    }
    
    return { error: `Failed to perform search: ${error.message}` };
  }
}

/**
 * Αναζητά πληροφορίες στο διαδίκτυο και επιστρέφει μια περίληψη των αποτελεσμάτων
 * @param {string} query - Ερώτημα αναζήτησης
 * @returns {Promise<string>} - Περίληψη των αποτελεσμάτων
 */
async function getInfoFromWeb(query) {
  const results = await searchGoogle(query);
  
  if (results.error) {
    return `Δεν ήταν δυνατή η αναζήτηση πληροφοριών: ${results.error}`;
  }
  
  if (results.length === 0) {
    return 'Δεν βρέθηκαν αποτελέσματα για το συγκεκριμένο ερώτημα.';
  }
  
  // Δημιουργία περίληψης με τα κορυφαία αποτελέσματα
  let summary = `Βρήκα τις εξής πληροφορίες για "${query}":\n\n`;
  
  results.forEach((result, index) => {
    summary += `${index + 1}. ${result.title}\n`;
    summary += `   ${result.snippet}\n`;
    summary += `   Πηγή: ${result.displayLink}\n\n`;
  });
  
  summary += `Αυτές οι πληροφορίες προέρχονται από αναζήτηση στο διαδίκτυο και μπορεί να μην είναι πλήρως ακριβείς.`;
  
  return summary;
}

module.exports = {
  searchGoogle,
  getInfoFromWeb
}; 