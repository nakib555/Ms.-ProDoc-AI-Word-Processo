
import React from 'react';
import { Paintbrush } from 'lucide-react';
import { DropdownRibbonButton } from '../common/DesignTools';

export const EffectsTool: React.FC = () => {
  return (
    <DropdownRibbonButton 
        id="theme_effects" 
        icon={Paintbrush} 
        label="Effects" 
    />
  );
};
