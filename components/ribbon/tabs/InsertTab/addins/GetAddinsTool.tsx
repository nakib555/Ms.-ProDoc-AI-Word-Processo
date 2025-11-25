
import React from 'react';
import { Puzzle } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const GetAddinsTool: React.FC = () => (
    <RibbonButton icon={Puzzle} label="Get Add-ins" onClick={() => alert('Add-in Store unavailable')} />
);
