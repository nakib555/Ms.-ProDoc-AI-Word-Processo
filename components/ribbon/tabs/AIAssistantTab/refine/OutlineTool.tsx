
import React from 'react';
import { List } from 'lucide-react';
import { SmallRibbonButton } from '../common/AITools';
import { useAI } from '../../../../../hooks/useAI';

export const OutlineTool: React.FC = () => {
  const { performAIAction } = useAI();
  return (
    <SmallRibbonButton icon={List} label="Outline" onClick={() => performAIAction('generate_outline')} />
  );
};
