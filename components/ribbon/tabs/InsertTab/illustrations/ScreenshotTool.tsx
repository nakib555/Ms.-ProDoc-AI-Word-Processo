
import React from 'react';
import { Camera } from 'lucide-react';
import { SmallRibbonButton } from '../common/InsertTools';

export const ScreenshotTool: React.FC = () => (
    <SmallRibbonButton icon={Camera} label="Screenshot" onClick={() => alert('Screenshot')} />
);
