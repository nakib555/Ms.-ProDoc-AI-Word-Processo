
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { AcceptTool } from './AcceptTool';
import { RejectTool } from './RejectTool';
import { PreviousChangeTool } from './PreviousChangeTool';
import { NextChangeTool } from './NextChangeTool';

export const ChangesGroup: React.FC = () => {
  return (
    <RibbonSection title="Changes">
         <div className="flex flex-col justify-center gap-0.5 px-1 h-full min-w-[80px]">
             <AcceptTool />
             <RejectTool />
         </div>
         <div className="flex flex-col justify-center gap-0.5 px-1 h-full min-w-[80px]">
             <PreviousChangeTool />
             <NextChangeTool />
         </div>
    </RibbonSection>
  );
};
