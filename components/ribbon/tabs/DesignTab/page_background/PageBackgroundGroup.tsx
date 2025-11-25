
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { WatermarkTool } from './WatermarkTool';
import { PageColorTool } from './PageColorTool';
import { PageBordersTool } from './PageBordersTool';

export const PageBackgroundGroup: React.FC = () => {
  return (
      <RibbonSection title="Page Background">
          <WatermarkTool />
          <PageColorTool />
          <PageBordersTool />
      </RibbonSection>
  );
};
