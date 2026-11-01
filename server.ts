import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini client on server side as required by gemini-api guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});
import { CLINICAL_SYSTEM_INSTRUCTION, getClinicalFallbackResponse } from './src/utils/clinicalAssistant';


// API endpoint for chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, message } = req.body;
    const userPrompt = message || (messages && messages[messages.length - 1]?.content);

    if (!userPrompt) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    // Try calling Gemini API with a timeout race (2500ms) for low latency
    const geminiPromise = (async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: CLINICAL_SYSTEM_INSTRUCTION,
        },
      });
      return response.text;
    })();

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 2500);
    });

    const result = await Promise.race([geminiPromise, timeoutPromise]);

    if (result && result.trim()) {
      return res.json({ reply: result.trim() });
    }

    // Use clinical engine response if API times out or network is sandboxed
    const fallbackReply = getClinicalFallbackResponse(userPrompt);
    return res.json({ reply: fallbackReply });
  } catch (error: unknown) {
    console.warn('Gemini API call timed out or failed, using clinical fallback engine:', error);
    const userPrompt = req.body.message || '';
    const fallbackReply = getClinicalFallbackResponse(userPrompt);
    return res.json({ reply: fallbackReply });
  }
});

// Vite middleware in development or static in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Dr. Harshika Consultation Platform running on 0.0.0.0:${PORT}`);
});
