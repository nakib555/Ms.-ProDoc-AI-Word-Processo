
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { VerticalTool } from './VerticalTool';
import { SideToSideTool } from './SideToSideTool';

export const PageMovementGroup: React.FC = () => {
  return (
    <RibbonSection title="Page Movement">
        <VerticalTool />
        <SideToSideTool />
    </RibbonSection>
  );
};
