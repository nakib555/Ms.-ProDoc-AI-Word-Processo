
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { PositionTool } from './PositionTool';
import { WrapTextTool } from './WrapTextTool';
import { LayeringTools } from './LayeringTools';
import { AlignmentTools } from './AlignmentTools';

export const ArrangeGroup: React.FC = () => {
  return (
    <RibbonSection title="Arrange">
         {/* Col 1: Pos/Wrap */}
         <div className="flex h-full items-center justify-center gap-0.5 px-1">
             <PositionTool />
             <WrapTextTool />
         </div>

         {/* Col 2: Layering */}
         <LayeringTools />

         {/* Col 3: Alignment */}
         <AlignmentTools />
    </RibbonSection>
  );
};
