
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { FocusTool } from './FocusTool';
import { ImmersiveReaderTool } from './ImmersiveReaderTool';

export const ImmersiveGroup: React.FC = () => {
  return (
    <RibbonSection title="Immersive">
        <FocusTool />
        <ImmersiveReaderTool />
    </RibbonSection>
  );
};
