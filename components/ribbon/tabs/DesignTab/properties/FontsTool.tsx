
import React from 'react';
import { Type } from 'lucide-react';
import { DropdownRibbonButton } from '../common/DesignTools';

export const FontsTool: React.FC = () => {
  return (
    <DropdownRibbonButton 
        id="theme_fonts" 
        icon={Type} 
        label="Fonts" 
    />
  );
};
