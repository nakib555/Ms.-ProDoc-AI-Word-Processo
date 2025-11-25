
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { TranslateTool } from './TranslateTool';

export const TranslateGroup: React.FC = () => {
  return (
    <RibbonSection title="Translate">
       <TranslateTool />
    </RibbonSection>
  );
};
