
import React from 'react';
import { AppWindow } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const NewWindowTool: React.FC = () => (
    <RibbonButton icon={AppWindow} label="New Window" onClick={() => window.open(window.location.href, '_blank')} />
);
