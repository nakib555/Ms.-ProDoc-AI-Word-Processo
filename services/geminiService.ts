
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

// Robustness: Timeout wrapper to prevent hanging requests
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Request timed out. Please try again."));
    }, ms);

    promise
      .then(value => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(reason => {
        clearTimeout(timer);
        reject(reason);
      });
  });
};

export const generateAIContent = async (
  operation: AIOperation,
  text: string,
  userPrompt?: string
): Promise<string> => {
  const client = getClient();
  if (!client) {
    return "Error: API Key not configured. Please use the API Key tool in the AI Assistant tab to configure your key.";
  }

  const systemPrompt = getSystemPrompt(operation, userPrompt);

  try {
    const call = client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `SYSTEM DIRECTIVE: ${systemPrompt}\n\nINPUT CONTEXT:\n${text}` }] }
      ],
    });

    const response = await withTimeout<GenerateContentResponse>(call, 30000);
    let resultText = response.text || "No response generated.";
    // Cleanup any markdown code blocks just in case, though prompt instructs against them
    resultText = resultText.replace(/^```html\s*/i, '').replace(/\s*```$/, '');
    return resultText;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes('timed out')) {
      return "The request took too long to process. Please try a shorter text selection.";
    }
    return "Sorry, I encountered an error processing your request. Please check your API key and internet connection.";
  }
};

export const streamAIContent = async function* (
  operation: AIOperation,
  text: string,
  userPrompt?: string
): AsyncGenerator<string, void, unknown> {
  const client = getClient();
  if (!client) throw new Error("API Key not configured. Please select an API key in the AI Assistant tab.");

  const systemPrompt = getSystemPrompt(operation, userPrompt);

  try {
    const responseStream = await client.models.generateContentStream({
      model: "gemini-2.5-flash",
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
    throw error;
  }
};

export const chatWithDocumentStream = async function* (
  history: { role: 'user' | 'model', text: string }[],
  lastMessage: string,
  documentContent: string
): AsyncGenerator<string, void, unknown> {
  const client = getClient();
  if (!client) throw new Error("API Key not configured.");

  // Use the specific chat prompt from prompts.ts which includes the HATF manual
  const systemInstruction = getChatSystemPrompt(documentContent);

  // Construct history
  const historyContent = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  try {
    const chat = client.chats.create({
      model: "gemini-2.5-flash",
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
    throw error;
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
    throw new Error(error.message || "Failed to generate image.");
  }
};
