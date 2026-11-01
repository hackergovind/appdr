import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';
import { CLINICAL_SYSTEM_INSTRUCTION, getClinicalFallbackResponse } from '../src/utils/clinicalAssistant.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages, message } = req.body || {};
  const userPrompt = message || (messages && messages[messages.length - 1]?.content);

  if (!userPrompt) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: CLINICAL_SYSTEM_INSTRUCTION,
        },
      });

      if (response && response.text) {
        return res.status(200).json({ reply: response.text.trim() });
      }
    } catch (err) {
      console.warn('Gemini API call on serverless route error, using clinical fallback engine:', err);
    }
  }

  const fallback = getClinicalFallbackResponse(userPrompt);
  return res.status(200).json({ reply: fallback });
}
