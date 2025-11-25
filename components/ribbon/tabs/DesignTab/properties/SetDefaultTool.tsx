
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const SetDefaultTool: React.FC = () => {
  return (
    <RibbonButton 
        icon={CheckCircle2} 
        label="Set as Default" 
        onClick={() => alert("Settings saved as default.")} 
    />
  );
};
