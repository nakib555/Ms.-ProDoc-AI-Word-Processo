
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { ZoomTool } from './ZoomTool';
import { Zoom100Tool } from './Zoom100Tool';
import { OnePageTool } from './OnePageTool';
import { MultiplePagesTool } from './MultiplePagesTool';
import { PageWidthTool } from './PageWidthTool';

export const ZoomGroup: React.FC = () => {
  return (
    <RibbonSection title="Zoom">
        <ZoomTool />
        <Zoom100Tool />
        <div className="flex flex-col justify-center gap-0.5 px-1 h-full">
           <OnePageTool />
           <MultiplePagesTool />
           <PageWidthTool />
        </div>
    </RibbonSection>
  );
};
