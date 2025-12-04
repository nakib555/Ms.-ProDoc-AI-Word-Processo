
import { PRODOC_JSON_SCHEMA, MASTER_STYLE_GUIDE } from './prompts/schemas';
import { getBasicGrammarPrompt } from './prompts/tools/grammar';
import { getBasicSummaryPrompt } from './prompts/tools/summary';
import { getExpandPrompt, getShortenPrompt, getSimplifyPrompt } from './prompts/tools/refine';
import { getGenerateContentPrompt, getEditContentPrompt, getTemplateListPrompt, getGenerateOutlinePrompt, getContinueWritingPrompt } from './prompts/tools/draft';
import { getMakeProfessionalPrompt, getTonePrompt } from './prompts/tools/style';
import { getTranslatePrompt } from './prompts/tools/translate';

/**
 * Returns the system prompt with deep operational instructions for AI.
 */
export const getSystemPrompt = (operation: string, userPrompt?: string): string => {
  
  // Check for special override if Smart Doc Template mode used via this entry point
  if (userPrompt && userPrompt.includes("ACT AS A SMART DOCUMENT ARCHITECT")) {
      return userPrompt; // The prompt is fully constructed in the tool
  }

  switch (operation) {
    case "generate_template_list":
      return getTemplateListPrompt(userPrompt || '');

    case "translate_content":
      return getTranslatePrompt(userPrompt || '');

    case "summarize":
      return getBasicSummaryPrompt();

    case "fix_grammar":
      return getBasicGrammarPrompt();

    case "make_professional":
      return getMakeProfessionalPrompt();

    case "generate_content":
      return getGenerateContentPrompt(userPrompt || '');

    case "edit_content":
      return getEditContentPrompt(userPrompt || '');

    case "generate_outline":
      return getGenerateOutlinePrompt();
    
    case "expand":
      return getExpandPrompt();
      
    case "shorten":
      return getShortenPrompt();

    case "simplify":
      return getSimplifyPrompt();
      
    case "continue_writing":
      return getContinueWritingPrompt();

    default:
      if (operation.startsWith('tone_')) {
         const tone = operation.replace('tone_', '');
         return getTonePrompt(tone);
      }
      return "Process the input and return valid JSON matching the schema.\n" + PRODOC_JSON_SCHEMA;
  }
};

/**
 * System prompt for chat (non-JSON) context.
 */
export const getChatSystemPrompt = (documentContext: string): string => {
  return `
You are **Copilot**, an expert AI writing assistant embedded in a professional word processor.
Your goal is to help the user write, edit, and understand their document.

### CAPABILITIES:
1.  **Context Aware**: You have access to the document content. Use it to answer questions.
2.  **Professional**: Keep answers concise, helpful, and polite.
3.  **Formatting**: You can output HTML (<b>, <i>, <ul>, <li>, <table>) to format your responses nicely in the chat window.

### DOCUMENT CONTEXT:
${documentContext.slice(0, 50000)}
`;
};
