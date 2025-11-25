
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { PicturesTool } from './PicturesTool';
import { ShapesTool } from './ShapesTool';
import { IconsTool } from './IconsTool';
import { ThreeDModelsTool } from './ThreeDModelsTool';
import { SmartArtTool } from './SmartArtTool';
import { ChartTool } from './ChartTool';
import { ScreenshotTool } from './ScreenshotTool';

export const IllustrationsGroup: React.FC = () => {
  return (
      <RibbonSection title="Illustrations">
         <PicturesTool />

         <div className="grid grid-cols-2 gap-x-1 gap-y-0 px-1">
             {/* Col 1 */}
             <div className="flex flex-col gap-0">
                <ShapesTool />
                <IconsTool />
                <ThreeDModelsTool />
             </div>
             
             {/* Col 2 */}
             <div className="flex flex-col gap-0">
                 <SmartArtTool />
                 <ChartTool />
                 <ScreenshotTool />
             </div>
         </div>
      </RibbonSection>
  );
};
