
import React from 'react';
import { CheckCheck } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useAI } from '../../../../../hooks/useAI';

export const FixGrammarTool: React.FC = () => {
  const { performAIAction } = useAI();
  return (
    <RibbonButton 
        icon={CheckCheck} 
        label="Fix Grammar" 
        onClick={() => performAIAction('fix_grammar')} 
        title="Fix Grammar & Spelling"
    />
  );
};
