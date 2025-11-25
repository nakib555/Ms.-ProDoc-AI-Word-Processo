import React from 'react';
import { Shapes } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const InkToShapeTool: React.FC = () => {
  return (
    <RibbonButton 
       icon={Shapes} 
       label="Ink to Shape" 
       onClick={() => alert("Ink to Shape: Converts hand-drawn shapes to geometric shapes.")} 
    />
  );
};