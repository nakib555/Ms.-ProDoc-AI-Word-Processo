import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { InkToShapeTool } from './InkToShapeTool';
import { InkToMathTool } from './InkToMathTool';

export const ConvertGroup: React.FC = () => {
  return (
    <RibbonSection title="Convert">
        <InkToShapeTool />
        <InkToMathTool />
    </RibbonSection>
  );
};