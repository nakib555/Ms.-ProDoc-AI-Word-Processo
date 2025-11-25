
import React from 'react';
import { Smile } from 'lucide-react';
import { SmallRibbonButton } from '../common/InsertTools';

export const IconsTool: React.FC = () => (
    <SmallRibbonButton icon={Smile} label="Icons" onClick={() => alert('Icons Library')} />
);
