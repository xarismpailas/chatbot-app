require('dotenv').config();
const axios = require('axios');

// Παίρνουμε τα κλειδιά από το .env αρχείο
const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

// Συνάρτηση για αναζήτηση στο Google Custom Search API
async function testGoogleSearch(query) {
  console.log(`Δοκιμή αναζήτησης για: "${query}"`);
  console.log(`API Key: ${apiKey ? apiKey.substring(0, 5) + '...' : 'Missing'}`);
  console.log(`Search Engine ID: ${searchEngineId || 'Missing'}`);
  
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx: searchEngineId,
        q: query,
        num: 5
      }
    });
    
    console.log('\n✅ API response status:', response.status);
    console.log('\nΑποτελέσματα αναζήτησης:');
    
    if (response.data && response.data.items) {
      response.data.items.forEach((item, i) => {
        console.log(`\n${i + 1}. ${item.title}`);
        console.log(`   ${item.snippet}`);
        console.log(`   URL: ${item.link}`);
      });
      console.log(`\nΣύνολο αποτελεσμάτων: ${response.data.items.length}`);
    } else {
      console.log('Δεν βρέθηκαν αποτελέσματα');
    }
  } catch (error) {
    console.error('\n❌ Σφάλμα:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Δοκιμάζουμε την αναζήτηση με διαφορετικά ερωτήματα
async function runTests() {
  // Δοκιμή 1: Γενική αναζήτηση
  await testGoogleSearch('iltoto.gr');
  console.log('\n' + '-'.repeat(50) + '\n');
  
  // Δοκιμή 2: Συγκεκριμένη αναζήτηση για λοταρίες
  await testGoogleSearch('iltoto.gr τζόκερ');
}

runTests(); 