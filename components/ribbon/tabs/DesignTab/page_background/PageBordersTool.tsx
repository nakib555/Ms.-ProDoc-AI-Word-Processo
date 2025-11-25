
import React from 'react';
import { Square } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const PageBordersTool: React.FC = () => {
  return (
    <RibbonButton 
        icon={Square} 
        label="Page Borders" 
        onClick={() => alert("Page Borders Dialog")} 
    />
  );
};
