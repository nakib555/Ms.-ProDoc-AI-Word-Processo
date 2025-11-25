
import React from 'react';
import { Quote } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const InsertCitationTool: React.FC = () => (
    <RibbonButton 
       icon={Quote} 
       label="Insert Citation" 
       onClick={() => {}} 
       title="Insert Citation"
       hasArrow
    />
);
