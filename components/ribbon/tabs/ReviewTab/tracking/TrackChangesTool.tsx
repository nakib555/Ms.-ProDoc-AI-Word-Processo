
import React from 'react';
import { FileEdit } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const TrackChangesTool: React.FC = () => (
    <RibbonButton 
        icon={FileEdit} 
        label="Track Changes" 
        onClick={() => {}} 
        hasArrow
        iconClassName="text-amber-600 dark:text-amber-400"
    />
);
