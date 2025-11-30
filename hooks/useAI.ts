
import { AIOperation } from '../types';
import { generateAIContent, streamAIContent } from '../services/geminiService';
import { useEditor } from '../contexts/EditorContext';
import { jsonToHtml } from '../utils/documentConverter';

export interface AIOptions {
  mode?: 'insert' | 'replace' | 'edit';
  useSelection?: boolean;
}

export const useAI = () => {
  const { executeCommand, editorRef, setContent, isAIProcessing, setIsAIProcessing, setAiState } = useEditor();

  const performAIAction = async (
    operation: string, 
    customInput?: string, 
    options: AIOptions = { mode: 'insert' },
    restoreRange?: Range | null
  ) => {
    // 1. Restore Selection or Focus
    if (restoreRange) {
        try {
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(restoreRange);
            }
        } catch (e) {
            console.warn("Could not restore selection range", e);
        }
    } else {
        if (editorRef.current && document.activeElement !== editorRef.current && !editorRef.current.contains(document.activeElement)) {
             editorRef.current.focus();
        }
    }

    const selection = window.getSelection();
    const hasSelection = selection && selection.rangeCount > 0 && !selection.isCollapsed;
    let textToProcess = hasSelection ? selection.toString() : "";

    if (operation === 'continue_writing' && !textToProcess) {
        if (editorRef.current) {
            const allText = editorRef.current.innerText;
            textToProcess = allText.slice(-2000);
        }
    }

    // Special logic for generation vs editing
    if (operation === 'generate_content') {
        if (!customInput) {
            alert("Please provide a prompt.");
            return;
        }
        // If we are generating content (Inserting/Replacing Document), we generally ignore selection
        // unless specific 'useSelection' was passed (which usually implies Edit mode, but we use edit_content for that now)
        if (options.useSelection && !hasSelection) {
             textToProcess = ""; 
        } else if (!options.useSelection) {
             textToProcess = "";
        }
    } 
    else if (operation === 'edit_content') {
        if (!textToProcess) {
            alert("Please select text to refine or edit.");
            return;
        }
        if (!customInput) {
            alert("Please provide instructions for editing.");
            return;
        }
    }
    else if (!textToProcess && operation !== 'generate_content') {
        alert("Please select some text to use the AI Assistant.");
        return;
    }

    // Determine if we should treat the response as JSON (Structured Document)
    // Most generation tasks now use the JSON format defined in prompts.ts
    const expectsJson = 
        operation === 'generate_content' || 
        operation === 'edit_content' ||
        operation === 'continue_writing' || 
        operation === 'expand' || 
        operation === 'shorten' ||
        operation === 'simplify' ||
        operation === 'fix_grammar' ||
        operation === 'make_professional' ||
        operation === 'generate_outline' ||
        operation.startsWith('tone_');

    setAiState('thinking');

    try {
        // If we expect JSON, we don't stream visualization because we need the full valid JSON to parse
        // We use generateAIContent which waits for the full response and forces JSON mode
        if (expectsJson) {
            let jsonString = await generateAIContent(operation as AIOperation, textToProcess, customInput);
            
            // Brief "writing" state before insertion to update UI
            setAiState('writing');

            // Clean Markdown code blocks if present (common issue with LLM output)
            // Use regex to find the first JSON object structure
            jsonString = jsonString.trim();
            const match = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (match) {
                jsonString = match[1];
            } else if (jsonString.startsWith('```')) {
                // Fallback for unclosed code blocks or other variations
                jsonString = jsonString.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
            }

            let parsedData;
            try {
                parsedData = JSON.parse(jsonString);
            } catch (jsonError) {
                console.error("JSON Parse Error:", jsonError, "Raw Output:", jsonString);
                // Fallback: If it's not JSON, it might be an error message or plain text. 
                // We'll try to insert it as text if it's short, otherwise show error.
                if (jsonString.length < 500 && !jsonString.trim().startsWith('{')) {
                     executeCommand('insertText', jsonString);
                } else {
                     alert("The AI response was not in the expected format. Please try again.");
                }
                setAiState('idle');
                return;
            }

            if (parsedData.error) {
                alert("AI Error: " + parsedData.error);
                setAiState('idle');
                return;
            }

            // Convert structured JSON to HTML
            const generatedHtml = jsonToHtml(parsedData);

            if (options.mode === 'replace') {
                if (editorRef.current) {
                    // Safe replacement
                    executeCommand('selectAll');
                    executeCommand('insertHTML', generatedHtml);
                    // Clear selection
                    const sel = window.getSelection();
                    if(sel) sel.removeAllRanges();
                }
            } else {
                if (generatedHtml) {
                    executeCommand('insertHTML', generatedHtml);
                }
            }

        } else {
            // Legacy/Simple streaming for other tasks (like translate if not converted yet)
            const stream = streamAIContent(operation as AIOperation, textToProcess, customInput);
            let accumulatedContent = "";
            let isFirstChunk = true;
            
            for await (const chunk of stream) {
                if (isFirstChunk) {
                    setAiState('writing');
                    // Simple text insertion logic for non-JSON stream
                    document.execCommand('insertText', false, chunk);
                    isFirstChunk = false;
                } else {
                    document.execCommand('insertText', false, chunk);
                }
                accumulatedContent += chunk;
            }
        }

    } catch (e) {
        console.error(e);
        alert("AI processing failed. Please check your API key and network connection.");
    } finally {
        setAiState('idle');
    }
  };

  return { isProcessing: isAIProcessing, performAIAction };
};
