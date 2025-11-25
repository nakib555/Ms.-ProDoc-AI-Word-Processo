import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { SelectTool } from './SelectTool';
import { LassoTool } from './LassoTool';
import { EraserTool } from './EraserTool';

export const DrawingToolsGroup: React.FC = () => {
  return (
    <RibbonSection title="Drawing Tools">
        <div className="flex h-full gap-0.5 items-center px-1">
            <SelectTool />
            <LassoTool />
            <EraserTool />
        </div>
    </RibbonSection>
  );
};