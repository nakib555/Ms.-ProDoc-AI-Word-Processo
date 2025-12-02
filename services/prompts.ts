
import { AIOperation } from '../types';

/**
 * PRODOC_JSON_SCHEMA:
 * This schema defines the full structure of documents that the AI must generate.
 * Every field is explicitly described for robust AI understanding.
 */
const PRODOC_JSON_SCHEMA = `
{
  "document": {
    "title": "Document Title",
    "metadata": {
      "author": "AI Assistant",
      "created": "ISO Date",
      "version": "1.0",
      "language": "en-US"
    },
    "header": {
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "text": "Header Content",
              "style": {
                "bold": true,
                "fontFamily": "Arial",
                "fontSize": 12,
                "color": "#000000"
              }
            }
          ],
          "paragraphStyle": {
            "alignment": "center",
            "spacingAfter": 4
          }
        }
      ]
    },
    "footer": {
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "text": "Footer Content",
              "style": {
                "italic": true,
                "fontFamily": "Arial",
                "fontSize": 10,
                "color": "#555555"
              }
            }
          ],
          "paragraphStyle": {
            "alignment": "center",
            "spacingBefore": 4
          }
        }
      ]
    },
    "settings": {
      "pageSize": "Letter",
      "orientation": "portrait",
      "margins": {
        "top": 1,
        "bottom": 1,
        "left": 1,
        "right": 1
      },
      "columns": 1,
      "backgroundColor": "#FFFFFF"
    },
    "blocks": [
      {
        "type": "heading",
        "level": 1,
        "style": {
          "fontFamily": "Arial",
          "fontSize": 24,
          "color": "#000000",
          "bold": true,
          "marginTop": 0,
          "marginBottom": 12,
          "textAlign": "center"
        },
        "paragraphStyle": {
          "lineSpacing": 1.15,
          "spacingBefore": 0,
          "spacingAfter": 12
        },
        "content": [
          { "text": "Main Title", "bold": true }
        ]
      },
      {
        "type": "paragraph",
        "style": {
          "fontFamily": "Calibri",
          "fontSize": 11,
          "color": "#000000"
        },
        "paragraphStyle": {
          "alignment": "left",
          "lineSpacing": 1.15,
          "spacingBefore": 0,
          "spacingAfter": 8,
          "indentation": 0
        },
        "content": [
          { "text": "Standard body text follows universal formatting rules. " },
          { "text": "Bold text for emphasis.", "bold": true },
          { "text": " Italic text for nuance.", "italic": true },
          { "text": " Underlined text can be used sparingly.", "underline": true }
        ]
      },
      {
        "type": "list",
        "listType": "unordered",
        "markerStyle": "disc",
        "style": { "fontFamily": "Calibri", "fontSize": 11, "color": "#000000" },
        "paragraphStyle": { "lineSpacing": 1.15, "spacingAfter": 8, "spacingBefore": 0 },
        "items": [
          { "content": [ { "text": "First bullet item" } ] },
          { "content": [ { "text": "Second bullet item with bold text", "bold": true } ] }
        ]
      },
      {
        "type": "list",
        "listType": "ordered",
        "markerStyle": "decimal",
        "style": { "fontFamily": "Calibri", "fontSize": 11, "color": "#000000" },
        "paragraphStyle": { "lineSpacing": 1.15, "spacingAfter": 8, "spacingBefore": 0 },
        "items": [
          { "content": [ { "text": "First numbered item" } ] },
          { "content": [ { "text": "Second numbered item" } ] }
        ]
      },
      {
        "type": "table",
        "config": {
          "columns": 3,
          "columnWidths": ["20%", "40%", "40%"],
          "hasHeaderRow": true,
          "bandedRows": true,
          "bandedColumns": false,
          "borderColor": "#cbd5e1",
          "autoFit": "contents",
          "textWrapping": "none"
        },
        "style": {
          "width": "100%",
          "borderCollapse": "collapse",
          "fontFamily": "Calibri",
          "fontSize": 11,
          "color": "#000000"
        },
        "rows": [
          {
            "cells": [
              { "content": [ { "text": "Header 1", "bold": true } ], "style": { "backgroundColor": "#f1f5f9", "padding": "8px" } },
              { "content": [ { "text": "Header 2", "bold": true } ], "style": { "backgroundColor": "#f1f5f9", "padding": "8px" } },
              { "content": [ { "text": "Header 3", "bold": true } ], "style": { "backgroundColor": "#f1f5f9", "padding": "8px" } }
            ]
          },
          {
            "cells": [
              { "content": [ { "text": "Row1 Cell1" } ] },
              { "content": [ { "text": "Row1 Cell2" } ] },
              { "content": [ { "text": "Row1 Cell3" } ] }
            ]
          }
        ]
      }
    ]
  }
}
`;

/**
 * Returns the system prompt with deep operational instructions for AI.
 */
export const getSystemPrompt = (operation: AIOperation, userPrompt?: string): string => {
  let directive = "";

  switch (operation) {
    case "summarize":
      directive = `
TASK: Summarize the input while preserving structure.
- Use headings to represent sections.
- Use bullet points for key details.
- Maintain JSON block structure strictly.
`;
      break;

    case "fix_grammar":
      directive = `
TASK: Correct grammar and spelling.
- Preserve meaning and formatting.
- Maintain block types, headings, and list structures.
`;
      break;

    case "make_professional":
      directive = `
TASK: Rewrite in a professional, formal tone.
- Ensure clarity and conciseness.
- Use proper headings and paragraphs.
- Apply consistent formatting.
`;
      break;

    case "generate_content":
      directive = `
TASK: Generate content from the user prompt.
- Use headings, paragraphs, lists, tables, and images if needed.
- For new documents: include header/footer.
- For insertion: modify only the 'blocks' array.
- Apply proper spacing, alignment, font styles, and sizes.
- Include inline styling (bold, italic, underline, color) appropriately.
`;
      break;

    case "edit_content":
      directive = `
TASK: Edit the selected portion according to the prompt.
- Keep JSON structure valid.
- Preserve original styles where possible.
- Update content, inline formatting, or paragraph-level styling as requested.
`;
      break;

    case "generate_outline":
      directive = `
TASK: Generate a hierarchical outline.
- Use nested lists for subsections.
- Maintain numeric or bullet style consistency.
`;
      break;

    case "continue_writing":
      directive = `
TASK: Continue writing seamlessly.
- Predict next logical sections.
- Maintain consistent style, formatting, and block structure.
`;
      break;

    default:
      directive = "Enhance input text and return fully valid JSON.";
  }

  let systemPrompt = `
You are a **highly advanced AI document engine**.

========================
UNIVERSAL FORMATTING RULES
========================
1. Fonts: 'Calibri' (default), 'Arial', 'Times New Roman'
2. Font Sizes:
   - Body: 11–12
   - Subheadings: 14–18
   - Title: 24+
3. Line Spacing: 1.15–1.5
4. Paragraph Spacing: spacingBefore: 0, spacingAfter: 8
5. Colors: Body text #000000, headings #000000 or #1e293b
6. Alignment: left, right, center, justified
7. Margins: 1" default, configurable per page
8. Inline Styles: bold, italic, underline, highlight, color

========================
OUTPUT SCHEMA
========================
${PRODOC_JSON_SCHEMA}

========================
RULES
========================
1. Output ONLY raw JSON, no markdown or explanations.
2. Maintain 'blocks' array for main content.
3. Use 'paragraphStyle' for block-level properties.
4. Use 'style' for inline or container styling.
5. Include 'header' and 'footer' only for full documents.
6. Apply universal formatting rules consistently.

========================
DIRECTIVE
========================
${directive}
`;

  if (userPrompt) systemPrompt += `\nUSER PROMPT: ${userPrompt}`;

  return systemPrompt;
};

/**
 * System prompt for chat (non-JSON) context.
 */
export const getChatSystemPrompt = (documentContext: string): string => {
  return `
You are an expert AI assistant.
- Use document context to answer questions.
- Return text or HTML unless JSON output is explicitly requested.
- Maintain clarity, structure, and proper formatting.

DOCUMENT CONTEXT:
${documentContext.slice(0, 50000)}
`;
};
