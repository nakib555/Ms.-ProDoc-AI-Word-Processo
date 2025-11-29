
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
  let systemPrompt = "";
  switch (operation) {
    case 'summarize':
      systemPrompt = "You are a helpful editor. Summarize the following text concisely in a single paragraph. Retain the core message.";
      break;
    case 'fix_grammar':
      systemPrompt = "You are a professional editor. Fix any grammar, spelling, or punctuation errors in the following text. Do not change the meaning or style. Output only the corrected text.";
      break;
    case 'make_professional':
      systemPrompt = "You are a corporate communication expert. Rewrite the following text to sound more professional, formal, and polished. Output only the rewritten text.";
      break;
    case 'tone_friendly':
      systemPrompt = "Rewrite the following text to sound friendly, warm, and approachable. Output only the rewritten text.";
      break;
    case 'tone_confident':
      systemPrompt = "Rewrite the following text to sound confident, assertive, and authoritative. Output only the rewritten text.";
      break;
    case 'tone_casual':
      systemPrompt = "Rewrite the following text to sound casual, relaxed, and conversational. Output only the rewritten text.";
      break;
    case 'expand':
      systemPrompt = "You are a creative writer. Expand on the following text, adding more detail, context, and descriptive language. Ensure the expanded version flows naturally. Use HTML tags (<p>, <strong>, etc.) for formatting.";
      break;
    case 'shorten':
      systemPrompt = "You are a concise editor. Shorten the following text to be more direct and to the point, removing unnecessary fluff and redundancy. Keep the key information.";
      break;
    case 'simplify':
      systemPrompt = "Rewrite the following text using simple language that is easy to understand for a general audience (EL5 style). Output only the simplified text.";
      break;
    case 'continue_writing':
      systemPrompt = "You are a skilled co-author. Read the provided text context and write the NEXT logical 1-2 paragraphs. \n\nIMPORTANT Rules:\n1. Do NOT repeat the provided text.\n2. Maintain the same tone, style, and formatting.\n3. Output strictly valid HTML tags (e.g., <p>, <strong>) for the new content.";
      break;
    case 'generate_content':
      systemPrompt = `You are an elite professional document writer. Generate high-quality content based on the user's request.

      **Content & Formatting Rules:**
      1.  **Output Format:** You MUST output strictly valid **HTML** content suitable for a WYSIWYG editor.
      2.  **No Markdown:** Do NOT use Markdown syntax (no ##, no **, no | table |). Convert all such formatting to HTML.
      3.  **Structure:** Use <h1>, <h2>, <h3> for headings. Use <p> for paragraphs. Use <ul>/<ol> and <li> for lists.
      4.  **Styling:** Use <strong> for bold, <em> for italic.
      
      **Tables:**
      - If the user asks for a table or data comparison, use standard HTML <table> tags.
      - **CRITICAL:** You MUST apply inline CSS to tables for them to render correctly.
      - **Table Style:** <table style="border-collapse: collapse; width: 100%; margin: 1em 0; border: 1px solid #cbd5e1;">
      - **Header Style:** <th style="background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: 600;">
      - **Cell Style:** <td style="border: 1px solid #cbd5e1; padding: 8px;">
      
      **Output:**
      - Return ONLY the HTML content to be inserted into the document body.
      - Do not wrap the output in \`\`\`html ... \`\`\`.
      `;
      break;
    case 'generate_outline':
      systemPrompt = "Generate a structured outline based on the topic or content of the following text. Use HTML lists (<ul>, <ol>).";
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
      systemPrompt = "You are a helpful AI writing assistant.";
  }

  if (userPrompt) {
    // Append prompt to instructions if it's a generation task to ensure clarity
    if (operation === 'generate_content') {
        systemPrompt = `${systemPrompt}\n\nUser Request: ${userPrompt}`;
    } else {
        // For editing operations, the prompt acts as a specific instruction override or addition
        systemPrompt = `${systemPrompt}\n\nSpecific Instruction: ${userPrompt}`;
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
        { role: "user", parts: [{ text: `System Instruction: ${systemPrompt}\n\nInput Context:\n${text}` }] }
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
        { role: "user", parts: [{ text: `System Instruction: ${systemPrompt}\n\nInput Context:\n${text}` }] }
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
  const context = documentContent.replace(/<[^>]*>/g, ' ').slice(0, 100000); // Strip HTML tags for cleaner context or keep them if structural understanding is needed

  const systemInstruction = `You are Copilot, an intelligent document assistant. 
  You have access to the current document content. 
  Answer the user's questions based on the document content or help them write/edit.
  
  Current Document Context:
  ${context}
  
  Guidelines:
  - Be concise and professional.
  - If asked to write content, provide just the text.
  - If asked about the document, reference the content provided above.
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
