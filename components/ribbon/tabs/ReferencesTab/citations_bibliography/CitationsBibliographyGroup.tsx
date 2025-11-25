
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { InsertCitationTool } from './InsertCitationTool';
import { ManageSourcesTool } from './ManageSourcesTool';
import { StyleTool } from './StyleTool';
import { BibliographyTool } from './BibliographyTool';

export const CitationsBibliographyGroup: React.FC = () => {
  return (
    <RibbonSection title="Citations & Bibliography">
       <InsertCitationTool />
       <div className="flex flex-col justify-center gap-0.5 px-1 h-full min-w-[120px]">
           <ManageSourcesTool />
           <StyleTool />
           <BibliographyTool />
       </div>
    </RibbonSection>
  );
};
