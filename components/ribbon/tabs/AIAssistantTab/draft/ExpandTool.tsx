
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SmallRibbonButton } from '../common/AITools';
import { useAI } from '../../../../../hooks/useAI';

export const ExpandTool: React.FC = () => {
  const { performAIAction } = useAI();
  return (
    <SmallRibbonButton icon={ArrowRight} label="Expand" onClick={() => performAIAction('expand')} />
  );
};
