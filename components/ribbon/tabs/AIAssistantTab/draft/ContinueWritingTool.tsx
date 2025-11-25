
import React from 'react';
import { PenTool } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useAI } from '../../../../../hooks/useAI';

export const ContinueWritingTool: React.FC = () => {
  const { performAIAction } = useAI();
  return (
    <RibbonButton 
       icon={PenTool} 
       label="Continue Writing" 
       onClick={() => performAIAction('continue_writing')} 
       title="AI will continue writing from your text"
    />
  );
};
