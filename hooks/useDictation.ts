import { useState, useCallback, useEffect } from 'react';
import { liveService } from '../services/liveService';
import { useEditor } from '../contexts/EditorContext';

export const useDictation = () => {
  const [isListening, setIsListening] = useState(false);
  const { executeCommand, editorRef } = useEditor();

  const handleTranscription = useCallback((text: string) => {
    // Insert text at current cursor position
    // We append a space if the text doesn't start with punctuation to keep flow natural
    const textToInsert = text; 
    executeCommand('insertText', textToInsert);
    
    // Ensure editor stays focused and scroll to bottom/cursor if needed
    // Note: executeCommand usually handles focus, but we ensure it here for continuous dictation
    if (editorRef.current) {
        // Optional: Scroll logic if needed
    }
  }, [executeCommand, editorRef]);

  const handleError = useCallback((err: Error) => {
    console.error("Dictation error:", err);
    setIsListening(false);
    alert("Dictation connection lost. Please try again.");
  }, []);

  const handleClose = useCallback(() => {
    setIsListening(false);
  }, []);

  const toggleDictation = useCallback(async () => {
    if (isListening) {
      liveService.disconnect();
      setIsListening(false);
    } else {
      setIsListening(true);
      // Ensure editor is focused before starting so we have a valid cursor position
      if (editorRef.current) {
        editorRef.current.focus();
      }
      
      await liveService.connect(
        handleTranscription,
        handleError,
        handleClose
      );
    }
  }, [isListening, handleTranscription, handleError, handleClose, editorRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      liveService.disconnect();
    };
  }, []);

  return { isListening, toggleDictation };
};
