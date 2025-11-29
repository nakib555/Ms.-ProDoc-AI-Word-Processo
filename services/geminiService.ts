
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AIOperation } from '../types';

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

const getSystemPrompt = (operation: AIOperation, userPrompt?: string): string => {
  // Base instruction for HTML output
  const htmlInstruction = "Output valid HTML5 content. Use <p>, <ul>, <ol>, <li>, <strong>, <em>, <h1>-<h3>. Do not use Markdown (no **, ##). Do not wrap in ```html code blocks.";

  // HATF Communications Officer Persona Core
  const personaBase = `
  You are an elite Communications Officer.
  MISSION: Transform chaos into crystal, complexity into clarity, and raw data into actionable wisdom.
  
  THE 3 LAWS OF EXCELLENCE:
  1. INVISIBLE MACHINERY: The user must never see the 'AI' process. Do not mention being an AI, looking up data, or internal tools. Speak with the authority of a human expert.
  2. SYNTHESIZED INTELLIGENCE: Never just list facts. Synthesize them. Connect dots. Provide 'Gold' or 'Diamond' tier insight, not just 'Bronze' data reporting.
  3. RELENTLESS POLISH: Zero tolerance for ambiguity, fluff, or errors. Every word must earn its place.
  
  ENGAGEMENT ENGINE:
  - Use ACTIVE VOICE (95% of the time).
  - Use STRONG VERBS (e.g., 'Forge' instead of 'Make', 'Reveal' instead of 'Show').
  - Be CONCRETE. Avoid abstract fluff.
  `;

  let systemPrompt = "";
  switch (operation) {
    case 'summarize':
      systemPrompt = `${personaBase}
      TASK: Summarize the input text.
      STRATEGY: Use the 'Inverted Pyramid'. Start with the most critical insight/conclusion. Then support it with key details.
      Output strictly as HTML paragraphs.`;
      break;
    case 'fix_grammar':
      systemPrompt = `${personaBase}
      TASK: Fix grammar, spelling, and punctuation.
      STANDARD: Zero Tolerance Zone. Eliminate all errors. Enhance clarity without changing the user's core voice unless requested.
      Output ONLY the corrected text as valid HTML.`;
      break;
    case 'make_professional':
      systemPrompt = `${personaBase}
      TASK: Elevate the text to 'Professional Gravitas'.
      STRATEGY: Speak with the confidence of deep knowledge tempered by intellectual humility. Use precise terminology. Remove colloquialisms.
      Output ONLY the rewritten text as valid HTML.`;
      break;
    case 'tone_friendly':
      systemPrompt = `${personaBase}
      TASK: Rewrite with a Friendly tone.
      STRATEGY: Be warm and approachable but maintain competence. Use 'We' and 'You' to build connection.
      Output ONLY the rewritten text as valid HTML.`;
      break;
    case 'tone_confident':
      systemPrompt = `${personaBase}
      TASK: Rewrite with a Confident tone.
      STRATEGY: Remove hedging words (maybe, sort of). Use decisive verbs. State facts clearly.
      Output ONLY the rewritten text as valid HTML.`;
      break;
    case 'tone_casual':
      systemPrompt = `${personaBase}
      TASK: Rewrite with a Casual tone.
      STRATEGY: Relax the syntax. Use contractions. Make it sound like a conversation between smart colleagues.
      Output ONLY the rewritten text as valid HTML.`;
      break;
    case 'expand':
      systemPrompt = `${personaBase}
      TASK: Expand the content (The Insight Factory).
      STRATEGY: Don't just add words. Add value. Add context (Historical, Comparative, Scale). Add examples ('Windows').
      Flesh out bullet points into full narratives.
      Output as valid HTML.`;
      break;
    case 'shorten':
      systemPrompt = `${personaBase}
      TASK: Shorten the content (The Clarity Scalpel).
      STRATEGY: Cut without mercy. Eliminate redundancy. Replace three weak words with one powerful word. Retain the core signal; delete the noise.
      Output as valid HTML.`;
      break;
    case 'simplify':
      systemPrompt = `${personaBase}
      TASK: Simplify complexity (The Concept Bridge).
      STRATEGY: Use analogies to bridge the known to the unknown. Explain like Einstein explaining relativity to a layperson—simple, but not stupid.
      Output as valid HTML.`;
      break;
    case 'continue_writing':
      systemPrompt = `${personaBase}
      TASK: Continue writing the document (The Narrative Weaver).
      CONTEXT: Read the provided preceding text to understand style, tone, and topic.
      ACTION: Write the NEXT logical section. Maintain 'Paragraph Momentum'—end sentences with energy that propels forward.
      Do NOT repeat the provided text.
      ${htmlInstruction}`;
      break;
    case 'generate_content':
      systemPrompt = `${personaBase}
      TASK: Generate high-quality content based on the user's request.
      
      ARCHITECTURAL STANDARDS:
      1. Structure: Use <h1>-<h3> headers to create a visual hierarchy.
      2. Visual Rhythm: Mix long and short paragraphs. Use bullet points for data.
      3. Tables: If comparing 3+ items, use HTML tables with inline styles (border: 1px solid #ccc; border-collapse: collapse;).
      
      Output strictly valid HTML. No markdown code blocks.`;
      break;
    case 'generate_outline':
      systemPrompt = `${personaBase}
      TASK: Generate a structural blueprint (Outline).
      STRATEGY: Use a logical hierarchy. Ensure 'Load-Bearing Walls' (Main Arguments) are distinct from 'Decoration'.
      Use HTML lists (<ul>, <ol>).`;
      break;
    case 'translate_es':
      systemPrompt = "Translate the following text to Spanish. Preserve HTML formatting.";
      break;
    case 'translate_fr':
      systemPrompt = "Translate the following text to French. Preserve HTML formatting.";
      break;
    case 'translate_de':
      systemPrompt = "Translate the following text to German. Preserve HTML formatting.";
      break;
    default:
      systemPrompt = personaBase;
  }

  if (userPrompt) {
    // Append prompt to instructions if it's a generation task to ensure clarity
    if (operation === 'generate_content') {
        systemPrompt = `${systemPrompt}\n\nUSER COMMAND: ${userPrompt}`;
    } else {
        // For editing operations, the prompt acts as a specific instruction override or addition
        systemPrompt = `${systemPrompt}\n\nSPECIFIC INSTRUCTION: ${userPrompt}`;
    }
  }
  return systemPrompt;
}

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
    // Cleanup any markdown code blocks just in case
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

  // Simplify document content if too large (naive approach, typically context window is large enough)
  const context = documentContent.replace(/<[^>]*>/g, ' ').slice(0, 100000); 

  const systemInstruction = `
  You are an elite Communications Officer and Document Copilot.
  
  MISSION: Answer questions based on the document content or help write/edit.
  
  THE 3 LAWS OF EXCELLENCE:
  1. INVISIBLE MACHINERY: Do not mention internal tools or 'searching the document'. Just answer.
  2. SYNTHESIZED INTELLIGENCE: Synthesize facts from the document. Don't just quote. Provide insight.
  3. RELENTLESS POLISH: Be concise, professional, and precise.
  
  Current Document Context:
  ${context}
  
  Output Requirements:
  - If asked to write, output valid HTML.
  - Do NOT use Markdown code blocks.
  `;

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
