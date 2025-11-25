
import React from 'react';
import { Scissors } from 'lucide-react';
import { SmallRibbonButton } from '../common/AITools';
import { useAI } from '../../../../../hooks/useAI';

export const ShortenTool: React.FC = () => {
  const { performAIAction } = useAI();
  return (
    <SmallRibbonButton icon={Scissors} label="Shorten" onClick={() => performAIAction('shorten')} />
  );
};
