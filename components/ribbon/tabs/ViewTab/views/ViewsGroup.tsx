
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { ReadModeTool } from './ReadModeTool';
import { PrintLayoutTool } from './PrintLayoutTool';
import { WebLayoutTool } from './WebLayoutTool';
import { OutlineTool } from './OutlineTool';
import { DraftTool } from './DraftTool';

export const ViewsGroup: React.FC = () => {
  return (
    <RibbonSection title="Views">
         <ReadModeTool />
         <PrintLayoutTool />
         <WebLayoutTool />
         <div className="flex flex-col justify-center gap-0.5 px-1 h-full">
            <OutlineTool />
            <DraftTool />
         </div>
    </RibbonSection>
  );
};
