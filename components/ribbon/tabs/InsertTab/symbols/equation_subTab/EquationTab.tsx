
import React from 'react';
import { EquationTabProvider } from './EquationTabContext';
import { ToolsGroup } from './tools/ToolsGroup';
import { ConversionsGroup } from './conversions/ConversionsGroup';
import { SymbolsGroup } from './symbols/SymbolsGroup';
import { StructuresGroup } from './structures/StructuresGroup';
import { RibbonSeparator } from '../../../../common/RibbonSeparator';

export const EquationTab: React.FC = () => {
  return (
    <EquationTabProvider>
        <ToolsGroup />
        <RibbonSeparator />
        <ConversionsGroup />
        <RibbonSeparator />
        <SymbolsGroup />
        <RibbonSeparator />
        <StructuresGroup />
    </EquationTabProvider>
  );
};
