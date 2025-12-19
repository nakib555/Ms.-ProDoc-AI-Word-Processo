
import React from 'react';
import { Volume2 } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const ImmersiveReaderTool: React.FC = () => (
    <RibbonButton 
        icon={Volume2} 
        label="Immersive Reader" 
        onClick={() => {}} 
        iconClassName="text-emerald-600 dark:text-emerald-400"
    />
);
