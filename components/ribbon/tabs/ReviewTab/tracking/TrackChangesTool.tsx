
import React from 'react';
import { FileEdit } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const TrackChangesTool: React.FC = () => (
    <RibbonButton 
        icon={FileEdit} 
        label="Track Changes" 
        onClick={() => {}} 
        hasArrow
    />
);
