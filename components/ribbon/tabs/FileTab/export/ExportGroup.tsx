import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { ExportTool } from './ExportTool';

export const ExportGroup: React.FC = () => {
  return (
    <RibbonSection title="Export">
      <ExportTool />
    </RibbonSection>
  );
};