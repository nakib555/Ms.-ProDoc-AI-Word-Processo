
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { DictateTool } from './DictateTool';
import { ReadAloudTool } from './ReadAloudTool';

export const VoiceGroup: React.FC = () => {
  return (
    <RibbonSection title="Voice">
         <div className="flex h-full items-center gap-1 px-1">
            <DictateTool />
            <ReadAloudTool />
         </div>
    </RibbonSection>
  );
};
