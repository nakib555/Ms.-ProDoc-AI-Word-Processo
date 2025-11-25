
import React from 'react';
import { WrapText } from 'lucide-react';
import { DropdownButton } from '../common/LayoutTools';

export const WrapTextTool: React.FC = () => {
  return (
    <DropdownButton 
        id="wrap" 
        icon={WrapText} 
        label="Wrap Text" 
    />
  );
};
