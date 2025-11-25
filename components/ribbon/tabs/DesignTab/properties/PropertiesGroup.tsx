
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { ColorsTool } from './ColorsTool';
import { FontsTool } from './FontsTool';
import { ParagraphSpacingTool } from './ParagraphSpacingTool';
import { EffectsTool } from './EffectsTool';
import { SetDefaultTool } from './SetDefaultTool';

export const PropertiesGroup: React.FC = () => {
  return (
      <RibbonSection title="Properties">
          <ColorsTool />
          <FontsTool />
          <ParagraphSpacingTool />
          <EffectsTool />
          <SetDefaultTool />
      </RibbonSection>
  );
};
