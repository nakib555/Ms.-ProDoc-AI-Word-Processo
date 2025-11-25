
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { CoverPageTool } from './CoverPageTool';
import { BlankPageTool } from './BlankPageTool';
import { PageBreakTool } from './PageBreakTool';

export const PagesGroup: React.FC = () => {
  return (
      <RibbonSection title="Pages">
         <div className="flex flex-col gap-0 justify-center h-full px-1 min-w-[100px]">
             <CoverPageTool />
             <BlankPageTool />
             <PageBreakTool />
         </div>
      </RibbonSection>
  );
};
