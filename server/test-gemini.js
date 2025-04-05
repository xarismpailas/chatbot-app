require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Εμφάνιση του API key για επαλήθευση (αφαίρεσε αυτή τη γραμμή σε production)
console.log(`API Key: ${process.env.GEMINI_API_KEY}`);

// Αρχικοποίηση του Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Δοκιμάζουμε διαφορετικά μοντέλα
async function testModel(modelName) {
  console.log(`\nTesting model: ${modelName}`);
  
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    
    console.log(`Sending test prompt to ${modelName}...`);
    
    // Απλό prompt για δοκιμή
    const prompt = 'Γεια σου! Πες μου μια σύντομη ιστορία.';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Response received successfully!');
    console.log('----------------------------');
    console.log(text.substring(0, 100) + '...');
    console.log('----------------------------');
    
    return true;
  } catch (error) {
    console.error(`Error with model ${modelName}:`);
    console.error(error.message);
    return false;
  }
}

// Εκτέλεση δοκιμών με διαφορετικά μοντέλα
async function runTests() {
  console.log('Starting Gemini API tests...');
  
  // Λίστα μοντέλων για δοκιμή
  const models = [
    'gemini-pro',
    'gemini-1.5-flash',   // Νέο μοντέλο που προτείνεται στο μήνυμα σφάλματος
    'gemini-1.5-pro',     // Άλλο πιθανό μοντέλο 1.5
    'gemini-1.0-pro',
    'text-bison',
    'gemini-pro-vision',
    'gemini-ultra'
  ];
  
  let successfulModel = null;
  
  for (const model of models) {
    const success = await testModel(model);
    if (success) {
      console.log(`✅ Model ${model} works successfully!`);
      successfulModel = model;
    } else {
      console.log(`❌ Model ${model} failed.`);
    }
  }
  
  if (successfulModel) {
    console.log(`\nFound working model: ${successfulModel}`);
    console.log('Update your .env file with this model name.');
  } else {
    console.log('\nNo working models found. Check your API key and network connection.');
  }
}

// Εκτέλεση των δοκιμών
runTests()
  .then(() => console.log('All tests completed!'))
  .catch(err => console.error('Tests failed with error:', err.message)); 