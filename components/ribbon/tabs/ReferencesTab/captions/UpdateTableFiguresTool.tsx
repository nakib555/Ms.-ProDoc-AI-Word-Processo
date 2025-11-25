
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { SmallRibbonButton } from '../common/ReferencesTools';

export const UpdateTableFiguresTool: React.FC = () => (
    <SmallRibbonButton icon={RefreshCw} label="Update Table" onClick={() => {}} className="opacity-50 cursor-not-allowed" />
);
