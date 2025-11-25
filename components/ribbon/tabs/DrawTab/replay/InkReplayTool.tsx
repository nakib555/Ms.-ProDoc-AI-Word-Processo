import React from 'react';
import { Play } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const InkReplayTool: React.FC = () => {
  return (
    <RibbonButton 
       icon={Play} 
       label="Ink Replay" 
       onClick={() => {}} 
       title="Ink Replay"
    />
  );
};