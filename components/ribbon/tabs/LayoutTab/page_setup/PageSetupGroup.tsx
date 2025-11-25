
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { MarginsTool } from './MarginsTool';
import { OrientationTool } from './OrientationTool';
import { SizeTool } from './SizeTool';
import { ColumnsTool } from './ColumnsTool';
import { BreaksTool } from './BreaksTool';
import { LineNumbersTool } from './LineNumbersTool';
import { HyphenationTool } from './HyphenationTool';

export const PageSetupGroup: React.FC = () => {
  return (
    <RibbonSection title="Page Setup">
        <MarginsTool />
        <OrientationTool />
        <SizeTool />
        <ColumnsTool />
        <BreaksTool />
        <LineNumbersTool />
        <HyphenationTool />
    </RibbonSection>
  );
};
