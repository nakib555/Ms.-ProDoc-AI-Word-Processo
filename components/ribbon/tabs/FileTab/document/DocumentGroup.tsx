import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { InfoTool } from './InfoTool';
import { NewTool } from './NewTool';
import { OpenTool } from './OpenTool';

export const DocumentGroup: React.FC = () => {
  return (
    <RibbonSection title="Document">
      <InfoTool />
      <NewTool />
      <OpenTool />
    </RibbonSection>
  );
};