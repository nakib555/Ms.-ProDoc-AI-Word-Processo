
import React from 'react';
import { Accessibility } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const CheckAccessibilityTool: React.FC = () => (
    <RibbonButton 
        icon={Accessibility} 
        label="Check Accessibility" 
        onClick={() => {}} 
        title="Check Accessibility" 
    />
);
