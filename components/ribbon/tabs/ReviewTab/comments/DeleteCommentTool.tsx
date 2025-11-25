
import React from 'react';
import { Trash2 } from 'lucide-react';
import { SmallRibbonButton } from '../common/ReviewTools';

export const DeleteCommentTool: React.FC = () => (
    <SmallRibbonButton icon={Trash2} label="Delete" onClick={() => {}} disabled hasArrow />
);
