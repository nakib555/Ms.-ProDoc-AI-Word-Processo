import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { ShareTool } from './ShareTool';
import { PrintTool } from './PrintTool';

export const ShareGroup: React.FC = () => {
  return (
    <RibbonSection title="Share">
      <ShareTool />
      <PrintTool />
    </RibbonSection>
  );
};