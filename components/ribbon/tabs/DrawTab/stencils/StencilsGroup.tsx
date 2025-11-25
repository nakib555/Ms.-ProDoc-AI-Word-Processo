import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { RulerTool } from './RulerTool';

export const StencilsGroup: React.FC = () => {
  return (
    <RibbonSection title="Stencils">
        <RulerTool />
    </RibbonSection>
  );
};