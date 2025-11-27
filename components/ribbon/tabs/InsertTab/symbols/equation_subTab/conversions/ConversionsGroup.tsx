
import React from 'react';
import { RibbonSection } from '../../../../../common/RibbonSection';
import { UnicodeTool } from './UnicodeTool/UnicodeTool';
import { LaTaxTool } from './LaTaxTool/LaTaxTool';
import { abcTextTool as AbcTextTool } from './abcTextTool/abcTextTool';
import { ConvertTool } from './ConvertTool/ConvertTool';

export const ConversionsGroup: React.FC = () => {
  return (
    <RibbonSection title="Conversions">
        <div className="flex flex-col justify-between h-full px-1 min-w-[110px] py-0.5">
            <div className="flex items-center gap-3 px-1 mb-1">
                <UnicodeTool />
                <LaTaxTool />
            </div>
            
            <div className="flex items-center gap-1 border-t border-slate-200 dark:border-slate-700 pt-1">
                <AbcTextTool />
                <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-600 mx-0.5"></div>
                <ConvertTool />
            </div>
        </div>
    </RibbonSection>
  );
};
