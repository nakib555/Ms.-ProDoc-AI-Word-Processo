
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { SmallRibbonButton } from '../common/ReferencesTools';

export const UpdateIndexTool: React.FC = () => (
    <SmallRibbonButton icon={RefreshCw} label="Update Index" onClick={() => {}} className="opacity-50 cursor-not-allowed" />
);
