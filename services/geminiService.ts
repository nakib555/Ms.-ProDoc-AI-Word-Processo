
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AIOperation } from '../types';
import { getSystemPrompt, getChatSystemPrompt } from './prompts';

const getClient = () => {
  // Check localStorage first for user-provided key
  const localKey = localStorage.getItem('gemini_api_key');
  if (localKey) {
    return new GoogleGenAI({ apiKey: localKey });
  }
  
  // Always create a new client to ensure we use the latest API Key from the environment if available
  if (process.env.API_KEY) {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return null;
};

const formatGeminiError = (error: any): string => {
  const msg = error.message || error.toString();
  const lowerMsg = msg.toLowerCase();
  
  if (lowerMsg.includes('429') || lowerMsg.includes('quota') || lowerMsg.includes('exhausted')) {
    return "⚠️ Quota exceeded. The AI usage limit has been reached. Please check your billing or try again later.";
  }
  if (lowerMsg.includes('503') || lowerMsg.includes('overloaded') || lowerMsg.includes('capacity')) {
    return "⚠️ The AI model is currently overloaded. Please try again in a few moments.";
  }
  if (lowerMsg.includes('key') || lowerMsg.includes('auth')) {
    return "⚠️ Invalid or missing API Key. Please check your settings.";
  }
  return `⚠️ AI Error: ${msg}`;
};

export const generateAIContent = async (
  operation: AIOperation,
  text: string,
  userPrompt?: string,
  model: string = "gemini-3-pro-preview"
): Promise<string> => {
  const client = getClient();
  if (!client) {
    return JSON.stringify({ error: "API Key not configured. Please use the API Key tool in the AI Assistant tab." });
  }

  const systemPrompt = getSystemPrompt(operation, userPrompt);

  try {
    const response = await client.models.generateContent({
      model: model,
      contents: [
        { role: "user", parts: [{ text: `SYSTEM DIRECTIVE: ${systemPrompt}\n\nINPUT CONTEXT:\n${text}` }] }
      ],
      config: {
        responseMimeType: "application/json", 
      }
    });
    
    // Safety check for empty responses
    if (!response.text) {
        throw new Error("Empty response from AI model.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return JSON.stringify({ error: formatGeminiError(error) });
  }
};

export const streamAIContent = async function* (
  operation: AIOperation,
  text: string,
  userPrompt?: string,
  model: string = "gemini-3-pro-preview"
): AsyncGenerator<string, void, unknown> {
  const client = getClient();
  if (!client) throw new Error("API Key not configured.");

  const systemPrompt = getSystemPrompt(operation, userPrompt);

  try {
    const responseStream = await client.models.generateContentStream({
      model: model,
      contents: [
        { role: "user", parts: [{ text: `SYSTEM DIRECTIVE: ${systemPrompt}\n\nINPUT CONTEXT:\n${text}` }] }
      ],
    });

    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    throw new Error(formatGeminiError(error));
  }
};

export const chatWithDocumentStream = async function* (
  history: { role: 'user' | 'model', text: string }[],
  lastMessage: string,
  documentContent: string,
  model: string = "gemini-3-pro-preview"
): AsyncGenerator<string, void, unknown> {
  const client = getClient();
  if (!client) throw new Error("API Key not configured.");

  const systemInstruction = getChatSystemPrompt(documentContent);

  const historyContent = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  try {
    const chat = client.chats.create({
      model: model,
      config: { systemInstruction },
      history: historyContent
    });

    const responseStream = await chat.sendMessageStream({ message: lastMessage });

    for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
            yield c.text;
        }
    }
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw new Error(formatGeminiError(error));
  }
};

export const generateAIImage = async (prompt: string): Promise<string | null> => {
  const client = getClient();
  if (!client) {
    throw new Error("API Key not configured.");
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error: any) {
    console.error("Gemini Image Gen Error:", error);
    throw new Error(formatGeminiError(error));
  }
};
