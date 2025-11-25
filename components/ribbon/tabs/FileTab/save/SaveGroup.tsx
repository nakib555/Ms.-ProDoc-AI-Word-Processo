import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { SaveTool } from './SaveTool';
import { SaveAsTool } from './SaveAsTool';

export const SaveGroup: React.FC = () => {
  return (
    <RibbonSection title="Save">
      <SaveTool />
      <SaveAsTool />
    </RibbonSection>
  );
};