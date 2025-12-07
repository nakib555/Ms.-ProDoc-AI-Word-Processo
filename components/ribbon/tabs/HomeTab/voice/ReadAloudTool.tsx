import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Square } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';

// Animated Visualizer Component
const WaveformIcon = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center gap-[2px] ${className}`}>
      <style>{`
        @keyframes waveform {
            0%, 100% { height: 20%; }
            50% { height: 100%; }
        }
      `}</style>
      {[0, 1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="w-[2.5px] bg-current rounded-full"
            style={{ 
                height: '40%',
                animation: 'waveform 0.6s ease-in-out infinite', 
                animationDelay: `${i * 0.1}s` 
            }} 
          />
      ))}
  </div>
);

export const ReadAloudTool: React.FC = () => {
  const { content } = useEditor();
  const [isReading, setIsReading] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check content presence for disabled state using innerText to respect visibility
  useEffect(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = (tempDiv.innerText || '').trim();
    setHasContent(text.length > 0);
  }, [content]);

  // Monitor speech synthesis state to sync UI if it stops externally
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
          if (window.speechSynthesis) {
              window.speechSynthesis.cancel();
          }
      };
  }, []);

  const handleReadAloud = () => {
    if (isReading) {
        window.speechSynthesis.cancel();
        setIsReading(false);
        return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Get visible text content
    const textToRead = (tempDiv.innerText || '').replace(/\s+/g, ' ').trim();

    if (textToRead.length > 0) {
        window.speechSynthesis.cancel(); // Cancel any existing speech

        const utterance = new SpeechSynthesisUtterance(textToRead);
        utteranceRef.current = utterance;
        
        // Attempt to set a preferred voice (English)
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            // Prefer a high quality Google voice or standard English
            const preferredVoice = voices.find(v => 
                (v.name.includes('Google') && v.name.includes('English')) || 
                (v.name.includes('Natural') && v.lang.startsWith('en'))
            ) || voices.find(v => v.lang.startsWith('en'));
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
        };

        loadVoices();
        // If voices aren't loaded yet (Chrome behavior), listen for event
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
             window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        utterance.onstart = () => setIsReading(true);
        utterance.onend = () => setIsReading(false);
        utterance.onerror = (e) => {
            // Check for interruption vs actual error
            if (e.error !== 'interrupted' && e.error !== 'canceled') {
                console.error("TTS Error:", e); 
            }
            setIsReading(false);
        };

        window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <RibbonButton 
        icon={isReading ? WaveformIcon : Volume2} 
        label={isReading ? "Stop" : "Read Aloud"} 
        onClick={handleReadAloud} 
        disabled={!hasContent}
        className={isReading ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200" : ""}
        title={!hasContent ? "No content to read" : isReading ? "Stop Reading" : "Read document aloud"}
    />
  );
};
