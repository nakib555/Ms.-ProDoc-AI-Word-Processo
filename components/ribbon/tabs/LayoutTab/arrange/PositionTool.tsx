
import React from 'react';
import { Move } from 'lucide-react';
import { DropdownButton } from '../common/LayoutTools';

export const PositionTool: React.FC = () => {
  return (
    <DropdownButton 
        id="position" 
        icon={Move} 
        label="Position" 
    />
  );
};
