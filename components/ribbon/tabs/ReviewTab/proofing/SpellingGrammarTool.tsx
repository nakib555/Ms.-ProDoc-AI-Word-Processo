
import React from 'react';
import { SpellCheck } from 'lucide-react';
import { SmallRibbonButton } from '../common/ReviewTools';

export const SpellingGrammarTool: React.FC = () => (
    <SmallRibbonButton 
        icon={SpellCheck} 
        label="Spelling & Grammar" 
        onClick={() => alert("Spelling check complete.")} 
        className="text-slate-700"
        iconClassName="text-red-600 dark:text-red-400"
    />
);
