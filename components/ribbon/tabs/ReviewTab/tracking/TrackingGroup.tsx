
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { TrackChangesTool } from './TrackChangesTool';
import { AllMarkupTool } from './AllMarkupTool';
import { ShowMarkupTool } from './ShowMarkupTool';
import { ReviewingPaneTool } from './ReviewingPaneTool';

export const TrackingGroup: React.FC = () => {
  return (
    <RibbonSection title="Tracking">
         <TrackChangesTool />
         <div className="flex flex-col justify-center gap-0.5 px-1 h-full min-w-[130px]">
             <AllMarkupTool />
             <ShowMarkupTool />
             <ReviewingPaneTool />
         </div>
    </RibbonSection>
  );
};
