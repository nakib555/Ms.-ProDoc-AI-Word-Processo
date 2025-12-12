
import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useDictation } from '../../../../../hooks/useDictation';

export const DictateTool: React.FC = () => {
  const { isListening, toggleDictation } = useDictation();

  return (
    <div className="relative h-full">
        <RibbonButton 
            icon={isListening ? Mic : Mic} 
            label={isListening ? "Listening..." : "Dictate"} 
            onClick={toggleDictation} 
            title={isListening ? "Stop Dictation" : "Start Voice Dictation"}
            className={`h-full transition-all duration-300 ${isListening ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200' : ''}`}
            iconClassName={isListening ? "text-red-600" : "text-sky-500"}
        />
        
        {/* Live indicator ping */}
        {isListening && (
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
        )}
    </div>
  );
};
