
import React from 'react';
import { MoveVertical } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const VerticalTool: React.FC = () => (
    <RibbonButton 
      icon={MoveVertical} 
      label="Vertical" 
      onClick={() => {}} 
      className="bg-slate-100 text-blue-700" 
    />
);
