
import React from 'react';
import { RibbonSection } from '../../../../../common/RibbonSection';
import { FractionTool } from './FractionTool/FractionTool';
import { ScriptTool } from './ScriptTool/ScriptTool';
import { RadicalTool } from './RadicalTool/RadicalTool';
import { IntegralTool } from './IntegralTool/IntegralTool';
import { LargeOperatorTool } from './LargeOperatorTool/LargeOperatorTool';
import { BracketTool } from './BracketTool/BracketTool';
import { FunctionTool } from './FunctionTool/FunctionTool';
import { AccentTool } from './AccentTool/AccentTool';
import { LimitLogTool } from './LimitLogTool/LimitLogTool';
import { OperatorTool } from './OperatorTool/OperatorTool';
import { MatrixTool } from './MatrixTool/MatrixTool';

export const StructuresGroup: React.FC = () => {
  return (
    <RibbonSection title="Structures">
        <div className="flex items-center gap-0.5 h-full px-1">
            <FractionTool />
            <ScriptTool />
            <RadicalTool />
            <IntegralTool />
            <LargeOperatorTool />
            <BracketTool />
            <FunctionTool />
            <AccentTool />
            <LimitLogTool />
            <OperatorTool />
            <MatrixTool />
        </div>
    </RibbonSection>
  );
};
