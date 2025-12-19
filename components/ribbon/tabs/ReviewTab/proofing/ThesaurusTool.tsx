
import React from 'react';
import { BookOpen } from 'lucide-react';
import { SmallRibbonButton } from '../common/ReviewTools';

export const ThesaurusTool: React.FC = () => (
    <SmallRibbonButton 
        icon={BookOpen} 
        label="Thesaurus" 
        onClick={() => alert("Thesaurus...")} 
        iconClassName="text-orange-500 dark:text-orange-400"
    />
);
