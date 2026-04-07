const axios = require('axios');
require('dotenv').config();

async function testQuizGeneration() {
  console.log('Testing quiz generation...\n');
  
  // Test 1: Check OpenRouter API key
  console.log('1. Checking OpenRouter API key...');
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ OPENROUTER_API_KEY not found in .env');
    return;
  }
  console.log('✅ API key found:', process.env.OPENROUTER_API_KEY.substring(0, 20) + '...');
  
  // Test 2: Test OpenRouter API connection
  console.log('\n2. Testing OpenRouter API connection...');
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [{ role: 'user', content: 'Say "Hello, API is working!"' }],
        max_tokens: 50,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'AI Quiz LMS Test',
        },
        timeout: 30000,
      }
    );
    
    console.log('✅ API connection successful');
    console.log('Response:', response.data.choices[0].message.content);
  } catch (error) {
    console.error('❌ API connection failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else if (error.request) {
      console.error('No response received - check internet connection');
    } else {
      console.error('Error:', error.message);
    }
    return;
  }
  
  // Test 3: Test quiz generation with sample content
  console.log('\n3. Testing quiz generation with sample content...');
  const sampleContent = `
    JavaScript is a programming language that is one of the core technologies of the World Wide Web.
    It is a high-level, often just-in-time compiled language that conforms to the ECMAScript standard.
    JavaScript has dynamic typing, prototype-based object-orientation, and first-class functions.
  `;
  
  const prompt = `You are an expert quiz generator. Based on the following content, generate exactly 3 multiple-choice questions at Medium difficulty level.

CONTENT:
${sampleContent}

REQUIREMENTS:
- Generate exactly 3 questions
- Difficulty: Medium
- Each question should have exactly 4 options (A, B, C, D)
- Include the correct answer
- Include a brief explanation for each answer

FORMAT YOUR RESPONSE AS A VALID JSON ARRAY ONLY (no markdown, no code blocks):
[
  {
    "question": "What is...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation why this is correct"
  }
]

IMPORTANT: Return ONLY the JSON array, no other text.`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'AI Quiz LMS Test',
        },
        timeout: 60000,
      }
    );
    
    const responseText = response.data.choices[0].message.content;
    console.log('✅ Quiz generation successful');
    console.log('\nRaw response:');
    console.log(responseText);
    
    // Try to parse JSON
    console.log('\n4. Testing JSON parsing...');
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      let questions;
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(responseText);
      }
      
      console.log('✅ JSON parsing successful');
      console.log('Number of questions:', questions.length);
      console.log('\nParsed questions:');
      console.log(JSON.stringify(questions, null, 2));
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError.message);
    }
  } catch (error) {
    console.error('❌ Quiz generation failed');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testQuizGeneration();
