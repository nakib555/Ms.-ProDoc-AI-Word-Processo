
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { FixGrammarTool } from './FixGrammarTool';
import { SummarizeTool } from './SummarizeTool';
import { SimplifyTool } from './SimplifyTool';
import { OutlineTool } from './OutlineTool';
import { ExpandTool } from '../draft/ExpandTool';
import { ShortenTool } from '../draft/ShortenTool';

export const RefineGroup: React.FC = () => {
  return (
    <RibbonSection title="Edit & Refine">
       <div className="flex h-full items-center gap-1">
           <FixGrammarTool />
           <SummarizeTool />
       </div>
       
       <div className="flex flex-col justify-center gap-0.5 px-1 h-full min-w-[90px] border-l border-slate-100 dark:border-slate-800 ml-1 pl-1">
           <ExpandTool />
           <ShortenTool />
           <SimplifyTool />
       </div>
       
       <div className="flex flex-col justify-center gap-0.5 px-1 h-full border-l border-slate-100 dark:border-slate-800 ml-1 pl-1">
           <OutlineTool />
       </div>
    </RibbonSection>
  );
};
