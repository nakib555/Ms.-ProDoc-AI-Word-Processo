
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { DictateTool } from './DictateTool';

export const VoiceGroup: React.FC = () => {
  return (
    <RibbonSection title="Voice">
         <div className="h-full py-1">
            <DictateTool />
         </div>
    </RibbonSection>
  );
};
