
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { MacrosTool } from './MacrosTool';

export const MacrosGroup: React.FC = () => {
  return (
    <RibbonSection title="Macros">
        <MacrosTool />
    </RibbonSection>
  );
};
