
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { EditorTool } from './EditorTool';
import { SpellingGrammarTool } from './SpellingGrammarTool';
import { ThesaurusTool } from './ThesaurusTool';
import { WordCountTool } from './WordCountTool';

export const ProofingGroup: React.FC = () => {
  return (
    <RibbonSection title="Proofing">
        <EditorTool />
        <div className="flex flex-col justify-center gap-0.5 px-1 h-full min-w-[120px]">
            <SpellingGrammarTool />
            <ThesaurusTool />
            <WordCountTool />
        </div>
    </RibbonSection>
  );
};
