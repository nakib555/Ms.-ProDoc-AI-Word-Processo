
import React from 'react';
import { RibbonSection } from '../../../../../common/RibbonSection';
import { EquationBoxTool } from './EquationBoxTool/EquationBoxTool';
import { InkEquationTool } from './InkEquationTool/InkEquationTool';

export const ToolsGroup: React.FC = () => {
  return (
    <RibbonSection title="Tools">
        <div className="flex gap-1 h-full">
            <EquationBoxTool />
            <InkEquationTool />
        </div>
    </RibbonSection>
  );
};
