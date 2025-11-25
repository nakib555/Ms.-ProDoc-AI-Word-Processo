
import React from 'react';
import { RibbonSeparator } from '../../common/RibbonSeparator';
import { DesignTabProvider } from './DesignTabContext';

// Groups
import { DocumentFormattingGroup } from './document_formatting/DocumentFormattingGroup';
import { PropertiesGroup } from './properties/PropertiesGroup';
import { PageBackgroundGroup } from './page_background/PageBackgroundGroup';

export const DesignTab: React.FC = () => {
  return (
    <DesignTabProvider>
       <DocumentFormattingGroup />
       <RibbonSeparator />
       <PropertiesGroup />
       <RibbonSeparator />
       <PageBackgroundGroup />
    </DesignTabProvider>
  );
};
