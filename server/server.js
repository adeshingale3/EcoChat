import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Speechify } from '@speechify/api-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '.env') });

// Debug logging
console.log('Environment check:');
console.log('- API Key exists:', !!process.env.GOOGLE_API_KEY);
console.log('- .env path:', join(__dirname, '.env'));

const app = express();

// Extended CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Validate API key
if (!process.env.GOOGLE_API_KEY) {
  console.error('ERROR: GOOGLE_API_KEY is not set in .env file');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Add conversation history management
const conversationMemory = new Map();

const COMPANION_PROMPT = `You are Echo. When speaking, use natural speech patterns and punctuation.

### Your Core Nature:
- You're direct and honest - if you don't know something, just say so
- Never invent stories or details about the user's life
- Keep responses short and real (2-3 sentences max)
- Only reference what was actually shared in the current conversation

### Your Voice:
- Casual and friendly: "Hey!" "Yeah, that's tough" "I get that"
- Ask questions to understand better
- Show genuine interest without assumptions
- Be upfront if you've lost context

### Response Guide:
- If someone's vague: Ask for clarity
- If you're unsure: "I'm not sure I caught that. Can you tell me more?"
- If they mention something new: Don't pretend you knew about it before

### Golden Rules:
1. Never make up stories or details
2. Don't assume previous context unless explicitly shared
3. Keep it real and honest
4. Stay in the present conversation
5. It's okay to say "I don't know about that yet"

### Speech Patterns:
- Use commas for natural pauses
- End statements with periods for clear breaks
- Use ellipsis... for thoughtful pauses
- Add emphasis with exclamation marks sparingly!
- Break long responses into shorter phrases
- Use question marks to indicate rising intonation?`;

// Add this function before the chat endpoint
function formatForSpeech(text) {
  return text
    // Add breathing marks for natural pauses
    .replace(/([.!?])\s+/g, '$1 <break time="0.3s"/> ')
    // Add emphasis on emotional words
    .replace(/(amazing|wonderful|terrible|awful|love|hate)/gi, '<emphasis>$1</emphasis>')
    // Add slight pause for commas
    .replace(/,\s+/g, ', <break time="0.1s"/> ')
    // Add thoughtful pauses for ellipsis
    .replace(/\.\.\./g, '... <break time="0.5s"/> ');
}

const SPEECHIFY_API_KEY = process.env.VITE_SPEECHIFY_API_KEY;
if (!SPEECHIFY_API_KEY) {
  console.error('ERROR: VITE_SPEECHIFY_API_KEY is not set in .env file');
  process.exit(1);
}

const speechifyApi = new Speechify({ 
  apiKey: SPEECHIFY_API_KEY,
  strict: false
});

// Remove or comment out this section
// app.get('/api/token', async (req, res) => { ... });

app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation memory
    if (!conversationMemory.has(sessionId)) {
      conversationMemory.set(sessionId, {
        messages: [],
        sharedInfo: new Set(),
        lastInteraction: Date.now()
      });
    }
    
    const memory = conversationMemory.get(sessionId);
    memory.lastInteraction = Date.now();

    // Initialize chat with verified context only
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: COMPANION_PROMPT
        },
        {
          role: "model",
          parts: "Hey! What's on your mind?"
        },
        ...memory.messages.slice(-6).map(msg => ({  // Keep recent context only
          role: msg.isUser ? "user" : "model",
          parts: msg.text
        }))
      ]
    });

    const result = await chat.sendMessage(message);
    const responseText = await result.response.text();
    const formattedResponse = formatForSpeech(responseText);

    // Store only actual exchanged messages
    memory.messages.push(
      { text: message, isUser: true, timestamp: Date.now() },
      { text: responseText, isUser: false, timestamp: Date.now() }
    );

    // Cleanup old sessions
    const ONE_HOUR = 3600000;
    for (const [sid, data] of conversationMemory) {
      if (Date.now() - data.lastInteraction > ONE_HOUR) {
        conversationMemory.delete(sid);
      }
    }

    res.json({ 
      reply: responseText,
      speechText: formattedResponse 
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for: http://localhost:5173, http://localhost:5174`);
  console.log(`Server is running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('- GET  /api/token');
  console.log('- POST /api/chat');
});