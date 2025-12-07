
import React, { useState, useEffect } from 'react';
import { Volume2, Square } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';

export const ReadAloudTool: React.FC = () => {
  const { content } = useEditor();
  const [isReading, setIsReading] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  // Check content presence for disabled state
  useEffect(() => {
    // Strip HTML tags to check if there is actual text
    const text = content.replace(/<[^>]*>/g, '').trim();
    setHasContent(text.length > 0);
  }, [content]);

  // Monitor speech synthesis state
  useEffect(() => {
     const interval = setInterval(() => {
         if (!window.speechSynthesis.speaking && isReading) {
             setIsReading(false);
         }
     }, 200);
     return () => clearInterval(interval);
  }, [isReading]);

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          window.speechSynthesis.cancel();
      }
  }, []);

  const handleReadAloud = () => {
    if (isReading) {
        window.speechSynthesis.cancel();
        setIsReading(false);
        return;
    }

    // Create a temporary element to extract clean text from HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textToRead = tempDiv.innerText || '';

    if (textToRead.trim().length > 0) {
        window.speechSynthesis.cancel(); // Cancel any existing speech

        const utterance = new SpeechSynthesisUtterance(textToRead);
        
        // Optional: Attempt to set a preferred voice (English)
        // Note: Voices array might be empty if loaded immediately, but default works fine
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith('en'));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => setIsReading(false);
        utterance.onerror = (e) => {
            console.error("TTS Error:", e);
            setIsReading(false);
        };

        window.speechSynthesis.speak(utterance);
        setIsReading(true);
    }
  };

  return (
    <RibbonButton 
        icon={isReading ? Square : Volume2} 
        label={isReading ? "Stop" : "Read Aloud"} 
        onClick={handleReadAloud} 
        disabled={!hasContent}
        className={isReading ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200" : ""}
        title={!hasContent ? "No content to read" : isReading ? "Stop Reading" : "Read document aloud"}
    />
  );
};
