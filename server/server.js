import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();

// Configure CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://opulent-space-funicular-7vx5p6xrj3fjw4-5173.app.github.dev'
  ],
  credentials: true,
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
};

app.use(cors(corsOptions));

app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Initialize the model
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Therapist context prompt
const THERAPIST_PROMPT = `You are Echo, a compassionate AI therapist. Respond with empathy, 
active listening, and professional therapeutic techniques. Focus on emotional support and 
gentle guidance. Never give medical advice or diagnoses. If someone expresses thoughts of 
self-harm, direct them to professional help and emergency services.`;

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const chat = model.startChat({
      history: [
        { role: "user", parts: "You are a helpful AI assistant" },
        { role: "model", parts: "I understand my role" }
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    res.json({ reply: response.text() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});