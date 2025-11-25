
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { TranslateTool } from './TranslateTool';
import { LanguageTool } from './LanguageTool';

export const LanguageGroup: React.FC = () => {
  return (
    <RibbonSection title="Language">
         <TranslateTool />
         <LanguageTool />
    </RibbonSection>
  );
};
