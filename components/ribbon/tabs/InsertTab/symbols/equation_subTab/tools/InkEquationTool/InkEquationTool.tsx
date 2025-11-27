
import React from 'react';
import { PenTool } from 'lucide-react';
import { RibbonButton } from '../../../../../../common/RibbonButton';

export const InkEquationTool: React.FC = () => {
  return (
    <RibbonButton 
        icon={PenTool} 
        label="Ink Equation" 
        onClick={() => alert("Opens Ink Equation Editor")} 
        className="min-w-[70px]"
        title="Handwrite Equation"
    />
  );
};
