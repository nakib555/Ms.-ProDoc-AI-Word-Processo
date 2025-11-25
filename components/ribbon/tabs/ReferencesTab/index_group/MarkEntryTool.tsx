
import React from 'react';
import { Tag } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const MarkEntryTool: React.FC = () => (
    <RibbonButton 
      icon={Tag} 
      label="Mark Entry" 
      onClick={() => {}} 
      title="Mark Entry (Alt+Shift+X)"
    />
);
