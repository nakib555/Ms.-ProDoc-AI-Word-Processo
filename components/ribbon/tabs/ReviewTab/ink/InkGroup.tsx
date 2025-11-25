
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { HideInkTool } from './HideInkTool';

export const InkGroup: React.FC = () => {
  return (
    <RibbonSection title="Ink">
        <HideInkTool />
    </RibbonSection>
  );
};
