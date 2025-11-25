
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { EquationTool } from './EquationTool';
import { SymbolTool } from './SymbolTool';

export const SymbolsGroup: React.FC = () => {
  return (
      <RibbonSection title="Symbols">
         <EquationTool />
         <SymbolTool />
      </RibbonSection>
  );
};
