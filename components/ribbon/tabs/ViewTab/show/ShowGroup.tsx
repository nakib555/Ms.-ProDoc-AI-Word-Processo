
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { RulerCheckTool } from './RulerCheckTool';
import { GridlinesCheckTool } from './GridlinesCheckTool';
import { NavPaneCheckTool } from './NavPaneCheckTool';

export const ShowGroup: React.FC = () => {
  return (
    <RibbonSection title="Show">
        <div className="flex flex-col justify-center h-full px-1 min-w-[120px]">
           <RulerCheckTool />
           <GridlinesCheckTool />
           <NavPaneCheckTool />
        </div>
    </RibbonSection>
  );
};
