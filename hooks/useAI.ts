
import { AIOperation, PageConfig } from '../types';
import { generateAIContent, streamAIContent } from '../services/geminiService';
import { useEditor } from '../contexts/EditorContext';
import { jsonToHtml } from '../utils/documentConverter';

export interface AIOptions {
  mode?: 'insert' | 'replace' | 'edit';
  useSelection?: boolean;
}

export const useAI = () => {
  const { 
      executeCommand, 
      editorRef, 
      setContent, 
      isAIProcessing, 
      setIsAIProcessing, 
      setAiState, 
      content,
      setHeaderContent,
      setFooterContent,
      setPageConfig
  } = useEditor();

  const performAIAction = async (
    operation: string, 
    customInput?: string, 
    options: AIOptions = { mode: 'insert' },
    restoreRange?: Range | null
  ) => {
    console.log(`[useAI] performAIAction started. Operation: ${operation}, Mode: ${options.mode}`);
    
    // 1. Capture valid range to restore later (either passed in or current)
    let activeRange: Range | null = restoreRange || null;

    if (!activeRange && options.mode !== 'replace') {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            activeRange = sel.getRangeAt(0).cloneRange();
        }
    }

    // 2. Restore Selection/Focus temporarily to extract text context (only if not replacing)
    if (options.mode !== 'replace') {
        if (activeRange) {
            try {
                const sel = window.getSelection();
                if (sel) {
                    sel.removeAllRanges();
                    sel.addRange(activeRange);
                }
            } catch (e) {
                console.warn("[useAI] Could not restore selection range", e);
            }
        } else {
            if (editorRef.current && document.activeElement !== editorRef.current && !editorRef.current.contains(document.activeElement)) {
                 editorRef.current.focus();
            }
        }
    }

    const selection = window.getSelection();
    const hasSelection = selection && selection.rangeCount > 0 && !selection.isCollapsed;
    let textToProcess = hasSelection ? selection.toString() : "";

    if (operation === 'continue_writing' && !textToProcess) {
        if (editorRef.current) {
            const allText = editorRef.current.innerText;
            textToProcess = allText.slice(-5000); // Use last 5k chars for context
        }
    }

    // Special logic for generation vs editing
    if (operation === 'generate_content') {
        if (!customInput) {
            alert("Please provide a prompt.");
            return;
        }
        
        if (options.useSelection) {
             // Edit mode on specific selection - textToProcess is already set
        } else if (options.mode === 'insert') {
             // Insert mode - Provide document context so AI knows what it's contributing to
             textToProcess = content || "";
        } else if (options.mode === 'replace') {
             // Replace mode (New Doc) - Fresh start, no context needed
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

    console.log(`[useAI] Text to process length: ${textToProcess.length}, Expects JSON: ${expectsJson}`);
    setAiState('thinking');

    try {
        // If we expect JSON, we don't stream visualization because we need the full valid JSON to parse
        if (expectsJson) {
            console.log("[useAI] Calling generateAIContent...");
            let jsonString = await generateAIContent(operation as AIOperation, textToProcess, customInput);
            console.log("[useAI] Response received. Raw length:", jsonString.length);
            console.log("[useAI] Raw Response Snippet:", jsonString.substring(0, 200));
            
            // Brief "writing" state before insertion to update UI
            setAiState('writing');

            // Clean Markdown code blocks if present (common issue with LLM output)
            jsonString = jsonString.trim();
            
            // 1. Try regex to extract code block content
            const codeBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (codeBlockMatch) {
                jsonString = codeBlockMatch[1];
            } else {
                // 2. Fallback: Find outer JSON object braces
                const startIdx = jsonString.indexOf('{');
                const endIdx = jsonString.lastIndexOf('}');
                if (startIdx !== -1 && endIdx !== -1) {
                    jsonString = jsonString.substring(startIdx, endIdx + 1);
                }
            }

            let parsedData;
            try {
                parsedData = JSON.parse(jsonString);
                console.log("[useAI] JSON parsed successfully");
            } catch (jsonError) {
                console.error("[useAI] JSON Parse Error:", jsonError, "Raw Output:", jsonString);
                // Fallback: If it's not JSON, it might be an error message or plain text. 
                if (jsonString.length < 500 && !jsonString.trim().startsWith('{')) {
                     // Ensure focus before fallback text insertion
                     if (editorRef.current && options.mode !== 'replace') editorRef.current.focus();
                     
                     if (options.mode === 'replace') {
                        setContent(jsonString);
                     } else {
                        executeCommand('insertText', jsonString);
                     }
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

            // Logic to handle full document replacement including Header/Footer
            if (options.mode === 'replace') {
                console.log("[useAI] Executing REPLACE mode");
                
                if (parsedData.document) {
                    // Handle Settings (Page Setup)
                    if (parsedData.document.settings) {
                        const s = parsedData.document.settings;
                        setPageConfig((prev: PageConfig) => ({
                            ...prev,
                            size: s.pageSize || prev.size,
                            orientation: s.orientation || prev.orientation,
                            margins: s.margins ? { ...prev.margins, ...s.margins } : prev.margins,
                            pageColor: s.backgroundColor && s.backgroundColor !== '#FFFFFF' ? s.backgroundColor : undefined
                        }));
                    }

                    // Handle Header
                    if (parsedData.document.header) {
                        const headerHtml = jsonToHtml(parsedData.document.header);
                        setHeaderContent(headerHtml);
                    } else {
                        // Reset header if replacing document and no header provided
                        setHeaderContent('<div style="color: #94a3b8;">[Header]</div>');
                    }

                    // Handle Footer
                    if (parsedData.document.footer) {
                        const footerHtml = jsonToHtml(parsedData.document.footer);
                        setFooterContent(footerHtml);
                    } else {
                        // Reset footer if replacing document and no footer provided
                        setFooterContent('<div style="color: #94a3b8;">[Page <span class="page-number-placeholder">1</span>]</div>');
                    }

                    // Handle Body Content
                    const bodyBlocks = parsedData.document.blocks || parsedData.document.content || [];
                    const generatedHtml = jsonToHtml({ blocks: bodyBlocks }); // wrap to match converter expectation
                    
                    console.log("[useAI] Generated HTML for REPLACE:", generatedHtml);
                    
                    // Use setContent directly for full replacement to ensure consistency across pages
                    setContent(generatedHtml);
                    
                } else {
                    // Legacy format or simple content
                    const generatedHtml = jsonToHtml(parsedData);
                    console.log("[useAI] Generated HTML for REPLACE (Legacy):", generatedHtml);
                    setContent(generatedHtml);
                }
                
                // Reset scroll position
                if (editorRef.current) {
                    editorRef.current.scrollTop = 0;
                }
                
            } else {
                // Insert / Edit Mode
                console.log("[useAI] Executing INSERT/EDIT mode");
                const generatedHtml = jsonToHtml(parsedData);
                
                console.log("[useAI] Generated HTML for INSERT:", generatedHtml);

                if (activeRange) {
                    try {
                        console.log("[useAI] Restoring active range for insertion");
                        const sel = window.getSelection();
                        if (sel) {
                            sel.removeAllRanges();
                            sel.addRange(activeRange);
                        }
                    } catch(e) {
                        console.warn("[useAI] Failed to restore range for insertion", e);
                        // Fallback focus
                        if(editorRef.current) editorRef.current.focus();
                    }
                } else if (editorRef.current) {
                    console.log("[useAI] No range found, focusing editor as fallback");
                    editorRef.current.focus();
                }

                if (generatedHtml) {
                    console.log("[useAI] executing insertHTML command. Length: " + generatedHtml.length);
                    executeCommand('insertHTML', generatedHtml);
                    console.log("[useAI] insertHTML executed.");
                } else {
                    console.warn("[useAI] Generated HTML is empty, skipping insertion");
                }
            }

        } else {
            // Legacy/Simple streaming for other tasks
            console.log("[useAI] Starting Stream Mode");
            
            // For streaming, we also need to ensure focus is on editor initially
            if (activeRange) {
                 const sel = window.getSelection();
                 if (sel) {
                     sel.removeAllRanges();
                     sel.addRange(activeRange);
                 }
            }

            const stream = streamAIContent(operation as AIOperation, textToProcess, customInput);
            let isFirstChunk = true;
            
            for await (const chunk of stream) {
                if (isFirstChunk) {
                    setAiState('writing');
                    document.execCommand('insertText', false, chunk);
                    isFirstChunk = false;
                } else {
                    document.execCommand('insertText', false, chunk);
                }
            }
            console.log("[useAI] Streaming complete");
        }

    } catch (e) {
        console.error("[useAI] Error performing AI action:", e);
        alert("AI processing failed. Please check your API key and network connection.");
    } finally {
        setAiState('idle');
        console.log("[useAI] Action finished. State reset to IDLE.");
    }
  };

  return { isProcessing: isAIProcessing, performAIAction };
};
