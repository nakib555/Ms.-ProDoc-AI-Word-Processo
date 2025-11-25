
import React from 'react';
import { Box } from 'lucide-react';
import { SmallRibbonButton } from '../common/InsertTools';

export const ThreeDModelsTool: React.FC = () => (
    <SmallRibbonButton icon={Box} label="3D Models" onClick={() => alert('3D Models')} />
);
