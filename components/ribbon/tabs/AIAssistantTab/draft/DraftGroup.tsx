
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { ContinueWritingTool } from './ContinueWritingTool';
import { ExpandTool } from './ExpandTool';
import { ShortenTool } from './ShortenTool';
import { QuickPromptTool } from './QuickPromptTool';
import { WriteWithAITool } from './WriteWithAITool';

export const DraftGroup: React.FC = () => {
  return (
    <RibbonSection title="Draft">
       {/* New primary AI writing button */}
       <WriteWithAITool />
       
       {/* Separator */}
       <div className="w-[1px] bg-slate-200 h-4/5 my-auto mx-1"></div>

       {/* Existing quick prompt and other drafting tools */}
       <QuickPromptTool />
       
       {/* Separator */}
       <div className="w-[1px] bg-slate-200 h-4/5 my-auto mx-1"></div>
       
       <ContinueWritingTool />
       
       <div className="flex flex-col justify-center gap-0.5 px-1 h-full min-w-[90px]">
           <ExpandTool />
           <ShortenTool />
       </div>
    </RibbonSection>
  );
};
