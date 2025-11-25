import { useState, useCallback, useEffect } from 'react';
import { liveService } from '../services/liveService';
import { useEditor } from '../contexts/EditorContext';

export const useDictation = () => {
  const [isListening, setIsListening] = useState(false);
  const { executeCommand, editorRef } = useEditor();

  const handleTranscription = useCallback((text: string) => {
    // Insert transcribed text at the current cursor position
    executeCommand('insertText', text);
    
    // Ensure the editor keeps focus for continuous typing
    if (editorRef.current) {
      // Optional: Scroll to cursor if needed
    }
  }, [executeCommand, editorRef]);

  const handleError = useCallback((err: Error) => {
    console.error("Dictation error:", err);
    setIsListening(false);
    alert("Dictation stopped: " + err.message);
  }, []);

  const handleClose = useCallback(() => {
    setIsListening(false);
  }, []);

  const toggleDictation = useCallback(async () => {
    if (isListening) {
      liveService.disconnect();
      setIsListening(false);
    } else {
      // Focus editor before starting so we have a valid selection/cursor range
      if (editorRef.current) {
        editorRef.current.focus();
      }
      
      setIsListening(true);
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