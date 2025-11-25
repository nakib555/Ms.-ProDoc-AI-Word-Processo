
import React from 'react';
import { Download } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const MyAddinsTool: React.FC = () => (
    <RibbonButton icon={Download} label="My Add-ins" onClick={() => alert('No add-ins installed')} hasArrow />
);
