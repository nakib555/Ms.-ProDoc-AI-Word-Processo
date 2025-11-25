
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { NewWindowTool } from './NewWindowTool';
import { ArrangeAllTool } from './ArrangeAllTool';
import { SplitTool } from './SplitTool';
import { ViewSideBySideTool } from './ViewSideBySideTool';
import { SyncScrollingTool } from './SyncScrollingTool';
import { ResetWindowTool } from './ResetWindowTool';
import { SwitchWindowsTool } from './SwitchWindowsTool';

export const WindowGroup: React.FC = () => {
  return (
    <RibbonSection title="Window">
        <NewWindowTool />
        <div className="flex flex-col justify-center gap-0.5 px-1 h-full">
           <ArrangeAllTool />
           <SplitTool />
        </div>
        <div className="flex flex-col justify-center gap-0.5 px-1 h-full border-l border-slate-100 ml-1 pl-1">
           <ViewSideBySideTool />
           <SyncScrollingTool />
           <ResetWindowTool />
        </div>
        <SwitchWindowsTool />
    </RibbonSection>
  );
};
