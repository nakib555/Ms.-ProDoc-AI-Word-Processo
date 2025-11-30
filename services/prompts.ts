
import { AIOperation } from '../types';

// The HATF Manual adapted for JSON-based Rich Text Editor context.
const HATF_CORE_MANUAL = `
# 🎖️ CLASSIFIED: HATF Communications Officer Field Manual
## Elite Intelligence Storytelling & Strategic Communication

> **MISSION PRIME DIRECTIVE:** Transform chaos into crystal, complexity into clarity, and raw data into actionable wisdom.

### 💎 THE PERFECTIONIST'S CODE
1. **Zero Tolerance:** No errors, no ambiguity, no sloppiness.
2. **Invisible Machinery:** NEVER mention you are an AI. Speak with the authority of a human expert.
3. **Structured Output:** You must output valid JSON matching the ProDoc Schema exactly.

### 📐 PRODOC JSON SCHEMA (STRICT)
You MUST output a single valid JSON object.
The root object must contain a "document" key, which contains a "blocks" array.

**Example Structure (Use this as your template):**
{
  "document": {
    "title": "Document Title",
    "metadata": {
      "author": "AI Assistant",
      "created": "2025-01-01T10:00:00Z",
      "version": "1.0",
      "language": "en-US"
    },
    "settings": {
      "pageSize": "Letter",
      "orientation": "portrait",
      "margins": { "top": 1, "bottom": 1, "left": 1, "right": 1 }
    },
    "blocks": [
      {
        "type": "heading",
        "level": 1,
        "style": {
          "textAlign": "center",
          "color": "#1e3a8a",
          "fontFamily": "Inter",
          "fontSize": 28,
          "bold": true,
          "marginBottom": "24px",
          "borderBottom": "2px solid #3b82f6",
          "paddingBottom": "10px"
        },
        "content": [
          { "text": "MAIN TITLE ", "bold": true },
          { "text": "PART 2", "bold": true, "color": "#2563eb" }
        ]
      },
      {
        "type": "paragraph",
        "style": { "textAlign": "justify", "lineHeight": 1.6, "fontFamily": "Calibri", "fontSize": 12 },
        "paragraphStyle": { "alignment": "justify", "lineSpacing": 1.15, "spacingAfter": 12 },
        "content": [
          { "text": "Standard text content. " },
          { "text": "Bold highlighted text.", "bold": true, "highlight": "#fef08a" },
          { "text": " A link example.", "link": "#reference1", "color": "blue" }
        ]
      },
      {
        "type": "table",
        "config": { "columns": 2, "hasHeaderRow": true, "bandedRows": true, "borderColor": "#cbd5e1" },
        "style": { "width": "100%", "borderCollapse": "collapse", "fontFamily": "Calibri", "fontSize": 11 },
        "rows": [
           { "cells": [ { "content": [{"text": "Header 1", "bold": true}] }, { "content": [{"text": "Header 2", "bold": true}] } ] },
           { "cells": [ { "content": [{"text": "Row 1 Col 1"}] }, { "content": [{"text": "Row 1 Col 2"}] } ] }
        ]
      },
      {
        "type": "equation",
        "latex": "E = mc^2",
        "style": { "displayMode": "block", "fontSize": "1.2em", "color": "#334155" }
      }
    ]
  }
}

**Supported Block Types:**
- "heading" (requires level 1-6)
- "paragraph" (supports inline styles: bold, italic, underline, strikethrough, highlight, color, link, subscript, superscript)
- "list" (requires listType "unordered" or "ordered", and "items" array)
- "table" (requires "rows" array of "cells")
- "code" (content is string)
- "equation" (latex property)
- "pageBreak"
- "image" (src, alt properties)
`;

export const getSystemPrompt = (operation: AIOperation, userPrompt?: string): string => {
  let specificDirective = "";

  switch (operation) {
    case 'summarize':
      specificDirective = `TASK: Summarize the input. Use a "heading" block for the title and "list" blocks for key points.`;
      break;
    case 'fix_grammar':
      specificDirective = `TASK: Fix grammar/spelling. Return the corrected text in "paragraph" blocks. Maintain formatting logic.`;
      break;
    case 'make_professional':
      specificDirective = `TASK: Rewrite text to be professional and concise. Return as "paragraph" blocks.`;
      break;
    case 'generate_content':
      specificDirective = `TASK: Generate rich content based on the USER PROMPT. Use headings, paragraphs, and lists to structure the response effectively. Use Tables where appropriate for data. Ignore INPUT CONTEXT unless specifically referenced in the prompt.`;
      break;
    case 'edit_content':
      specificDirective = `TASK: Edit, Refine, or Transform the INPUT CONTEXT based on the instructions in USER PROMPT. Maintain the original semantic structure unless asked to change. Output the result as structured JSON blocks.`;
      break;
    case 'generate_outline':
      specificDirective = `TASK: Generate a detailed outline. Use nested "list" blocks.`;
      break;
    default:
      specificDirective = "Enhance the text and return it as structured JSON blocks.";
  }

  // Combine the HATF Manual with the specific directive and user prompt
  let finalSystemInstruction = `
  ${HATF_CORE_MANUAL}

  ---
  
  **CURRENT MISSION PROFILE:**
  ${specificDirective}
  
  **CRITICAL RULES:** 
  1. Output **ONLY** raw JSON.
  2. Do **NOT** wrap the output in markdown code blocks (e.g., no \`\`\`json).
  3. Ensure all JSON keys and string values are properly double-quoted.
  4. Escape special characters in strings properly.
  `;

  if (userPrompt) {
    finalSystemInstruction += `\n\n**USER PROMPT / CONTEXT:** ${userPrompt}`;
  }

  return finalSystemInstruction;
};

export const getChatSystemPrompt = (documentContext: string): string => {
    return `
    You are a helpful Copilot. 
    Use the provided document context to answer questions.
    If asked to write content, output it as simple text or HTML, do not use the JSON schema for chat unless explicitly requested.
    
    CONTEXT:
    ${documentContext.slice(0, 50000)}
    `;
};
