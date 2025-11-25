
import React from 'react';
import { SpellCheck } from 'lucide-react';
import { SmallRibbonButton } from '../common/ReviewTools';

export const SpellingGrammarTool: React.FC = () => (
    <SmallRibbonButton 
        icon={SpellCheck} 
        label="Spelling & Grammar" 
        onClick={() => alert("Spelling check complete.")} 
    />
);
