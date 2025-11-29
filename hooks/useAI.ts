
import { useState } from 'react';
import { AIOperation } from '../types';
import { generateAIContent, streamAIContent } from '../services/geminiService';
import { useEditor } from '../contexts/EditorContext';

export interface AIOptions {
  mode?: 'insert' | 'replace' | 'edit';
  useSelection?: boolean;
}

export const useAI = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { executeCommand, editorRef, setContent } = useEditor();

  const performAIAction = async (
    operation: string, 
    customInput?: string, 
    options: AIOptions = { mode: 'insert' },
    restoreRange?: Range | null
  ) => {
    // 1. Restore Selection FIRST if provided (crucial for Modals)
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
        // Fallback: If focus is lost and no range provided, try to refocus editor
        if (editorRef.current && document.activeElement !== editorRef.current && !editorRef.current.contains(document.activeElement)) {
             editorRef.current.focus();
        }
    }

    const selection = window.getSelection();
    const hasSelection = selection && selection.rangeCount > 0 && !selection.isCollapsed;
    let textToProcess = hasSelection ? selection.toString() : "";

    // Context gathering for continuation if no selection
    if (operation === 'continue_writing' && !textToProcess) {
        if (editorRef.current) {
            // Get last ~2000 chars to provide context
            const allText = editorRef.current.innerText;
            textToProcess = allText.slice(-2000);
        }
    }

    // For "generate_content", we rely on the prompt.
    // If "useSelection" is true (Edit Mode), we append the selection to the prompt context via the service.
    if (operation === 'generate_content') {
        if (!customInput) {
            alert("Please provide a prompt.");
            return;
        }
        
        if (options.useSelection && hasSelection) {
             // We are editing the selection based on the prompt
             // textToProcess is already set to selection.toString()
        } else {
             // We are generating new content.
             // If we are not using selection as context, clear textToProcess so we don't confuse the model
             textToProcess = ""; 
        }
    } else if (!textToProcess && operation !== 'generate_content') {
        // For refine tools etc, we need text.
        alert("Please select some text or ensure the document has content to use the AI Assistant.");
        return;
    }

    // Expanded list of streaming operations for better UX
    const shouldStream = 
        operation === 'generate_content' || 
        operation === 'continue_writing' || 
        operation === 'expand' || 
        operation === 'shorten' ||
        operation === 'simplify' ||
        operation === 'fix_grammar' ||
        operation === 'make_professional' ||
        operation.startsWith('tone_') ||
        operation.startsWith('translate_');

    setIsProcessing(true);

    if (shouldStream) {
        try {
            const stream = streamAIContent(operation as AIOperation, textToProcess, customInput);
            let isFirstChunk = true;
            let streamSpan: HTMLElement | null = null;
            let accumulatedContent = "";
            let spanId = "";
            
            for await (const chunk of stream) {
                if (isFirstChunk) {
                    setIsProcessing(false); // Hide loading overlay once writing starts
                    
                    // Handle Replacement Mode (New Document)
                    if (operation === 'generate_content' && options.mode === 'replace') {
                        if (editorRef.current) {
                            editorRef.current.innerHTML = ''; 
                            setContent(''); // Sync state
                            editorRef.current.focus(); 
                        }
                    }

                    spanId = `ai-stream-${Date.now()}`;
                    // Insert a span with visual indicators that AI is writing
                    // If text was selected, insertHTML replaces it, effectively "editing" it in place
                    const html = `<span id="${spanId}" class="ai-streaming" style="background-color: rgba(59, 130, 246, 0.1); border-bottom: 2px solid #3b82f6; transition: all 0.1s ease;">&#8203;</span>`;
                    executeCommand('insertHTML', html);
                    streamSpan = document.getElementById(spanId);
                    isFirstChunk = false;
                }

                // Robustness: Re-acquire element if lost (e.g., due to layout change/virtualization)
                if (!streamSpan || !streamSpan.isConnected) {
                    streamSpan = document.getElementById(spanId);
                }

                if (streamSpan) {
                    accumulatedContent += chunk;
                    
                    // Basic Markdown code block stripping for the stream view
                    let cleanHTML = accumulatedContent;
                    // Remove markdown code blocks wrapper if present
                    if (cleanHTML.startsWith('```html')) cleanHTML = cleanHTML.substring(7);
                    else if (cleanHTML.startsWith('```')) cleanHTML = cleanHTML.substring(3);
                    
                    if (cleanHTML.endsWith('```')) cleanHTML = cleanHTML.substring(0, cleanHTML.length - 3);
                    
                    // Update the content of the span directly
                    streamSpan.innerHTML = cleanHTML;
                    
                    // Keep visible - optional, can be jarring during layout changes if forced scroll
                    // streamSpan.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    // Buffer content if element is temporarily missing during render cycles
                    accumulatedContent += chunk;
                    
                    // Fallback: If we genuinely lost the span (layout switch killed it), 
                    // we keep accumulating. When layout stabilizes or stream ends, we might need to recover.
                    // For now, we rely on the re-acquisition logic above which checks every chunk.
                }
            }
            
            // Cleanup: Unwrap the span to merge content naturally into the document
            // Attempt to find the span one last time in case it reappeared
            if (spanId) {
                // Re-acquire one last time
                streamSpan = document.getElementById(spanId);
                
                if (streamSpan) {
                    const parent = streamSpan.parentNode;
                    if (parent) {
                        // Move children out
                        while (streamSpan.firstChild) {
                            parent.insertBefore(streamSpan.firstChild, streamSpan);
                        }
                        // Remove the styling span
                        parent.removeChild(streamSpan);
                    }
                }

                // Normalization ensures adjacent text nodes are merged
                editorRef.current?.normalize();
                if (editorRef.current) {
                    setContent(editorRef.current.innerHTML);
                }
            }
        } catch (e) {
            console.error(e);
            alert("AI Stream Error: " + e);
        } finally {
            setIsProcessing(false);
        }
        return;
    }

    // Non-streaming operations (Fallback)
    try {
      const result = await generateAIContent(operation as AIOperation, textToProcess, customInput);
      
      if (result) {
         if (result.trim().startsWith('<') || operation === 'generate_outline') {
             executeCommand('insertHTML', result);
         } else {
             executeCommand('insertText', result);
         }
      }
    } catch (e) {
      console.error(e);
      alert("AI Error: " + e);
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, performAIAction };
};
