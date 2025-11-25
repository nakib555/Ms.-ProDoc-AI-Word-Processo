
import React from 'react';
import { FileText } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useAI } from '../../../../../hooks/useAI';

export const SummarizeTool: React.FC = () => {
  const { performAIAction } = useAI();
  return (
    <RibbonButton 
        icon={FileText} 
        label="Summarize" 
        onClick={() => performAIAction('summarize')} 
    />
  );
};
