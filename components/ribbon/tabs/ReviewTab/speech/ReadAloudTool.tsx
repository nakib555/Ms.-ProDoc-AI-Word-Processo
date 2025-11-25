
import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const ReadAloudTool: React.FC = () => {
  const [isReading, setIsReading] = useState(false);

  const handleReadAloud = () => {
    if (isReading) {
        window.speechSynthesis.cancel();
        setIsReading(false);
        return;
    }

    const text = document.querySelector('.prodoc-editor')?.textContent;
    if (text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsReading(false);
        window.speechSynthesis.speak(utterance);
        setIsReading(true);
    }
  };

  return (
    <RibbonButton 
        icon={Volume2} 
        label={isReading ? "Stop" : "Read Aloud"} 
        onClick={handleReadAloud} 
        className={isReading ? "bg-blue-50 text-blue-700" : ""}
        title="Read Aloud"
    />
  );
};
