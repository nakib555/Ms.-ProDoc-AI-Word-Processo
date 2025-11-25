
import React from 'react';
import { Workflow } from 'lucide-react';
import { SmallRibbonButton } from '../common/InsertTools';

export const SmartArtTool: React.FC = () => (
    <SmallRibbonButton icon={Workflow} label="SmartArt" onClick={() => alert('SmartArt')} />
);
