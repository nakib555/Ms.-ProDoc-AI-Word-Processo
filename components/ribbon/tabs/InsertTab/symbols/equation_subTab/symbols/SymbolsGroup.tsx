
import React from 'react';
import { RibbonSection } from '../../../../../common/RibbonSection';
import { BasicMathTool } from './BasicMathTool/BasicMathTool';
import { GreekLettersTool } from './GreekLettersTool/GreekLettersTool';
import { LetterLikeSymbolsTool } from './Letter-LikeSymbolsTool/Letter-LikeSymbolsTool';
import { OperatorsTool } from './OperatorsTool/OperatorsTool';
import { ArrowsTool } from './ArrowsTool/ArrowsTool';
import { NegatedRelationsTool } from './NegatedRelationsTool/NegatedRelationsTool';
import { ScriptsTool } from './ScriptsTool/ScriptsTool';
import { GeometryTool } from './GeometryTool/GeometryTool';

export const SymbolsGroup: React.FC = () => {
  return (
    <RibbonSection title="Symbols">
        <div className="grid grid-rows-4 md:grid-rows-2 grid-flow-col gap-x-4 gap-y-1.5 h-full px-2 min-w-[320px]">
            <BasicMathTool />
            <GreekLettersTool />
            <LetterLikeSymbolsTool />
            <OperatorsTool />
            <ArrowsTool />
            <NegatedRelationsTool />
            <ScriptsTool />
            <GeometryTool />
        </div>
    </RibbonSection>
  );
};
