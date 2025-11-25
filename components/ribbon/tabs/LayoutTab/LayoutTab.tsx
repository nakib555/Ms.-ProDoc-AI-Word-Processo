
import React from 'react';
import { RibbonSeparator } from '../../common/RibbonSeparator';
import { LayoutTabProvider } from './LayoutTabContext';

// Groups
import { PageSetupGroup } from './page_setup/PageSetupGroup';
import { ParagraphGroup } from './paragraph/ParagraphGroup';
import { ArrangeGroup } from './arrange/ArrangeGroup';

export const LayoutTab: React.FC = () => {
  return (
    <LayoutTabProvider>
      <PageSetupGroup />
      <RibbonSeparator />
      <ParagraphGroup />
      <RibbonSeparator />
      <ArrangeGroup />
    </LayoutTabProvider>
  );
};
