import { useState } from 'react';
import { AIOperation } from '../types';
import { generateAIContent, streamAIContent } from '../services/geminiService';
import { useEditor } from '../contexts/EditorContext';

export const useAI = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { executeCommand, editorRef, setContent } = useEditor();

  const performAIAction = async (operation: string, customInput?: string) => {
    const selection = window.getSelection();
    let selectedText = selection?.toString();
    let textToProcess = selectedText;

    if (operation === 'continue_writing' && !selectedText) {
        if (editorRef.current) {
            const allText = editorRef.current.innerText;
            textToProcess = allText.slice(-2000);
        }
    }

    if (operation === 'generate_content') {
        if (!customInput) {
            alert("Please provide a prompt.");
            return;
        }
        textToProcess = customInput;
    } else if (!textToProcess) {
        alert("Please select some text or ensure the document has content to use the AI Assistant.");
        return;
    }

    const shouldStream = operation === 'generate_content' || operation === 'continue_writing' || operation === 'expand';

    setIsProcessing(true);

    if (shouldStream) {
        try {
            const stream = streamAIContent(operation as AIOperation, textToProcess || "", customInput);
            let isFirstChunk = true;
            let streamSpan: HTMLElement | null = null;
            let accumulatedContent = "";
            
            for await (const chunk of stream) {
                if (isFirstChunk) {
                    setIsProcessing(false); // Hide loading overlay once writing starts
                    
                    // For Quick Generate: Clear existing content if present before starting
                    if (operation === 'generate_content') {
                        if (editorRef.current) {
                            editorRef.current.innerHTML = ''; 
                            setContent(''); // Sync state
                            editorRef.current.focus(); 
                        }
                    }

                    const spanId = `ai-stream-${Date.now()}`;
                    // Insert a span with visual indicators that AI is writing
                    // Using a marker span allows us to update innerHTML safely without breaking the cursor position repeatedly
                    const html = `<span id="${spanId}" class="ai-streaming" style="background-color: rgba(59, 130, 246, 0.08); transition: all 0.2s ease;">&#8203;</span>`;
                    executeCommand('insertHTML', html);
                    streamSpan = document.getElementById(spanId);
                    isFirstChunk = false;
                }

                if (streamSpan && streamSpan.isConnected) {
                    accumulatedContent += chunk;
                    
                    // Basic Markdown code block stripping for the stream view
                    let cleanHTML = accumulatedContent;
                    if (cleanHTML.startsWith('```html')) cleanHTML = cleanHTML.substring(7);
                    if (cleanHTML.startsWith('```')) cleanHTML = cleanHTML.substring(3);
                    if (cleanHTML.endsWith('```')) cleanHTML = cleanHTML.substring(0, cleanHTML.length - 3);
                    
                    // Update the content of the span directly
                    // This handles partial tags better than insertAdjacentHTML because the browser parses the full accumulated string each time
                    streamSpan.innerHTML = cleanHTML;
                    
                    // Keep visible
                    streamSpan.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
            
            // Cleanup: Unwrap the span to merge content naturally into the document
            if (streamSpan) {
                const parent = streamSpan.parentNode;
                if (parent) {
                    // Move children out of the span
                    while (streamSpan.firstChild) {
                        parent.insertBefore(streamSpan.firstChild, streamSpan);
                    }
                    // Remove the empty span
                    parent.removeChild(streamSpan);
                }

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

    try {
      const result = await generateAIContent(operation as AIOperation, textToProcess || "");
      
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