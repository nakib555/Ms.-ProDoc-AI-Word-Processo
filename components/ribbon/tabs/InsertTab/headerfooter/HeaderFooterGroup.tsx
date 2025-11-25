
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { HeaderTool } from './HeaderTool';
import { FooterTool } from './FooterTool';
import { PageNumberTool } from './PageNumberTool';

export const HeaderFooterGroup: React.FC = () => {
  return (
      <RibbonSection title="Header & Footer">
             <HeaderTool />
             <FooterTool />
             <PageNumberTool />
      </RibbonSection>
  );
};
