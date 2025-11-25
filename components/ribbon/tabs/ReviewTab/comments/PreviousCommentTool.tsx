
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { SmallRibbonButton } from '../common/ReviewTools';

export const PreviousCommentTool: React.FC = () => (
    <SmallRibbonButton icon={ChevronLeft} label="Previous" onClick={() => {}} disabled />
);
