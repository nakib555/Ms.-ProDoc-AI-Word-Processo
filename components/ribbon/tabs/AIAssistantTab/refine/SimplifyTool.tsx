
import React from 'react';
import { Feather } from 'lucide-react';
import { SmallRibbonButton } from '../common/AITools';
import { useAI } from '../../../../../hooks/useAI';

export const SimplifyTool: React.FC = () => {
  const { performAIAction } = useAI();
  return (
    <SmallRibbonButton icon={Feather} label="Simplify" onClick={() => performAIAction('simplify')} />
  );
};
