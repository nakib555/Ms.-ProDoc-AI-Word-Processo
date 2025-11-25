
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { FixGrammarTool } from './FixGrammarTool';
import { SummarizeTool } from './SummarizeTool';
import { SimplifyTool } from './SimplifyTool';
import { OutlineTool } from './OutlineTool';

export const RefineGroup: React.FC = () => {
  return (
    <RibbonSection title="Refine">
       <FixGrammarTool />
       <SummarizeTool />
       <div className="flex flex-col justify-center gap-0.5 px-1 h-full min-w-[100px]">
           <SimplifyTool />
           <OutlineTool />
       </div>
    </RibbonSection>
  );
};
