
import React from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { SmallRibbonButton } from '../common/InsertTools';

export const CrossRefTool: React.FC = () => (
    <SmallRibbonButton icon={ArrowRightLeft} label="Cross-ref" onClick={() => {}} iconClassName="text-indigo-500 dark:text-indigo-400" />
);
