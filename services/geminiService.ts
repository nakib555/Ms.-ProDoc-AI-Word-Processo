import { GoogleGenAI, GenerateContentResponse, HarmCategory, HarmBlockThreshold, Modality } from "@google/genai";
import { AIOperation } from '../types';
import { getSystemPrompt, getChatSystemPrompt } from './prompts';

// Safety settings to allow standard business/creative writing without over-blocking
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

const getClient = () => {
  const localKey = localStorage.getItem('gemini_api_key');
  if (localKey) {
    return new GoogleGenAI({ apiKey: localKey });
  }
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
  if (lowerMsg.includes('key') || lowerMsg.includes('auth') || lowerMsg.includes('permission')) {
    return "⚠️ Invalid or missing API Key. Please check your settings in the AI Assistant tab.";
  }
  if (lowerMsg.includes('safety') || lowerMsg.includes('blocked')) {
    return "⚠️ Content blocked by safety filters. Please revise your prompt.";
  }
  return `⚠️ AI Error: ${msg}`;
};

const base64ToUint8Array = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<Uint8Array | null> => {
  const client = getClient();
  if (!client) {
      console.error("API Key not configured");
      return null;
  }

  try {
    // Truncate text if too long to prevent errors (approx limit check for TTS model)
    const safeText = text.slice(0, 4000); 
    
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: safeText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        return base64ToUint8Array(base64Audio);
    }
    return null;

  } catch (error) {
    console.error("[Gemini Service] Speech Gen Error:", error);
    return null;
  }
};

export const generateAIContent = async (
  operation: AIOperation,
  text: string,
  userPrompt?: string,
  model: string = "gemini-3-pro-preview"
): Promise<string> => {
  const storedModel = localStorage.getItem('gemini_model');
  const effectiveModel = storedModel || model;

  console.log(`[Gemini Service] generateAIContent. Op: ${operation}, Model: ${effectiveModel}`);
  const client = getClient();
  if (!client) {
    return JSON.stringify({ error: "API Key not configured. Please use the Settings in the AI Assistant tab." });
  }

  const systemPrompt = getSystemPrompt(operation, userPrompt);

  try {
    const response = await client.models.generateContent({
      model: effectiveModel,
      contents: [
        { role: "user", parts: [{ text: `SYSTEM INSTRUCTIONS:\n${systemPrompt}\n\nINPUT DATA:\n${text}` }] }
      ],
      config: {
        responseMimeType: "application/json", 
        safetySettings: SAFETY_SETTINGS,
        temperature: 0.7, // Balanced creativity
        topK: 40,
        topP: 0.95,
      }
    });
    
    if (!response.text) {
        throw new Error("Empty response received from AI.");
    }

    return response.text;
  } catch (error: any) {
    console.error("[Gemini Service] Error:", error);
    return JSON.stringify({ error: formatGeminiError(error) });
  }
};

export const streamAIContent = async function* (
  operation: AIOperation,
  text: string,
  userPrompt?: string,
  model: string = "gemini-3-pro-preview"
): AsyncGenerator<string, void, unknown> {
  const storedModel = localStorage.getItem('gemini_model');
  const effectiveModel = storedModel || model;

  const client = getClient();
  if (!client) throw new Error("API Key not configured.");

  const systemPrompt = getSystemPrompt(operation, userPrompt);

  try {
    const responseStream = await client.models.generateContentStream({
      model: effectiveModel,
      contents: [
        { role: "user", parts: [{ text: `SYSTEM INSTRUCTIONS:\n${systemPrompt}\n\nINPUT DATA:\n${text}` }] }
      ],
      config: {
        safetySettings: SAFETY_SETTINGS
      }
    });

    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("[Gemini Service] Stream Error:", error);
    throw new Error(formatGeminiError(error));
  }
};

export const chatWithDocumentStream = async function* (
  history: { role: 'user' | 'model', text: string }[],
  lastMessage: string,
  documentContent: string,
  model: string = "gemini-3-pro-preview"
): AsyncGenerator<string, void, unknown> {
  const storedModel = localStorage.getItem('gemini_model');
  const effectiveModel = storedModel || model;

  const client = getClient();
  if (!client) throw new Error("API Key not configured.");

  const systemInstruction = getChatSystemPrompt(documentContent);

  const historyContent = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  try {
    const chat = client.chats.create({
      model: effectiveModel,
      config: { 
        systemInstruction,
        safetySettings: SAFETY_SETTINGS
      },
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
    console.error("[Gemini Service] Chat Error:", error);
    throw new Error(formatGeminiError(error));
  }
};

export const generateAIImage = async (prompt: string): Promise<string | null> => {
  const client = getClient();
  if (!client) throw new Error("API Key not configured.");

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        safetySettings: SAFETY_SETTINGS
      }
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
    console.error("[Gemini Service] Image Gen Error:", error);
    throw new Error(formatGeminiError(error));
  }
};