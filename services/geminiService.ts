import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AIOperation } from '../types';

let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient && process.env.API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
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
      systemPrompt = "You are a helpful editor. Summarize the following text concisely in a single paragraph.";
      break;
    case 'fix_grammar':
      systemPrompt = "You are a professional editor. Fix any grammar, spelling, or punctuation errors in the following text. Do not change the meaning. Output only the corrected text.";
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
      systemPrompt = "You are a creative writer. Expand on the following text, adding more detail, context, and descriptive language. Keep the tone consistent.";
      break;
    case 'shorten':
      systemPrompt = "You are a concise editor. Shorten the following text to be more direct and to the point, removing unnecessary fluff. Output only the shortened text.";
      break;
    case 'simplify':
      systemPrompt = "Rewrite the following text using simple language that is easy to understand for a general audience (EL5 style). Output only the simplified text.";
      break;
    case 'continue_writing':
      systemPrompt = "You are a skilled co-author. Continue writing logically from the provided text context. Add about one or two paragraphs that flow naturally. Use simple HTML tags (e.g. <p>, <strong>, <em>) if formatting is needed. Do NOT use markdown code blocks.";
      break;
    case 'generate_content':
      systemPrompt = `You are an elite professional document writer. Generate high-quality content based on the user's request.

      **Formatting Rules:**
      1.  **Visual Style:** Create a clean, structured, and visually appealing document similar to modern MS Word.
      2.  **Font & Size:** Do **NOT** specify 'font-family' or 'font-size' styles inline. Allow the editor's default theme to apply.
      3.  **Typography:** Use **bold** (<strong>), *italic* (<em>), <u>underline</u>, and text highlight colors (background-color) where appropriate for emphasis.
      4.  **Paragraphs:** Use standard <p> tags. You MAY use 'text-align' (left, center, justify, right) and 'line-height' styles.
      5.  **Headings:** Use <h1>, <h2>, <h3> for document structure.
      6.  **Lists:** Use unnumbered (<ul>) and numbered (<ol>) lists for items.
      7.  **Tables:** If data is presented, use <table>. ALWAYS apply inline CSS to tables for a professional look (e.g., style="border-collapse: collapse; width: 100%; border: 1px solid #cbd5e1;"). Style table headers (<th>) with a subtle background color (e.g., #f1f5f9).
      
      Output ONLY valid HTML content inside the document body. Do NOT use Markdown code blocks.`;
      break;
    case 'generate_outline':
      systemPrompt = "Generate a structured outline based on the topic or content of the following text. Use HTML lists (<ul>, <ol>).";
      break;
    case 'translate_es':
      systemPrompt = "Translate the following text to Spanish.";
      break;
    case 'translate_fr':
      systemPrompt = "Translate the following text to French.";
      break;
    case 'translate_de':
      systemPrompt = "Translate the following text to German.";
      break;
    default:
      systemPrompt = "You are a helpful AI writing assistant.";
  }

  if (userPrompt) {
    // Append prompt to instructions if it's a generation task to ensure clarity
    if (operation === 'generate_content') {
        systemPrompt = `${systemPrompt}\n\nUser Prompt: ${userPrompt}`;
    } else {
        systemPrompt = userPrompt;
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
    return "Error: API Key not configured. Please check environment variables.";
  }

  const systemPrompt = getSystemPrompt(operation, userPrompt);

  try {
    const call = client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `Instruction: ${systemPrompt}\n\nInput:\n${text}` }] }
      ],
    });

    const response = await withTimeout<GenerateContentResponse>(call, 30000);
    let resultText = response.text || "No response generated.";
    resultText = resultText.replace(/^```html\s*/i, '').replace(/\s*```$/, '');
    return resultText;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes('timed out')) {
      return "The request took too long to process. Please try a shorter text selection.";
    }
    return "Sorry, I encountered an error processing your request. Please try again.";
  }
};

export const streamAIContent = async function* (
  operation: AIOperation,
  text: string,
  userPrompt?: string
): AsyncGenerator<string, void, unknown> {
  const client = getClient();
  if (!client) throw new Error("API Key not configured");

  const systemPrompt = getSystemPrompt(operation, userPrompt);

  try {
    const responseStream = await client.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `Instruction: ${systemPrompt}\n\nInput:\n${text}` }] }
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