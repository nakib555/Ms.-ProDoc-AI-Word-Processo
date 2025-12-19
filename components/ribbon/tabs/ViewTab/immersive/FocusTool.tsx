
import React from 'react';
import { Maximize } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const FocusTool: React.FC = () => (
    <RibbonButton 
        icon={Maximize} 
        label="Focus" 
        onClick={() => document.documentElement.requestFullscreen()} 
        iconClassName="text-indigo-600 dark:text-indigo-400"
    />
);
