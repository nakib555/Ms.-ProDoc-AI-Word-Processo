
import React from 'react';
import { RibbonSeparator } from '../../common/RibbonSeparator';
import { InsertTabProvider } from './InsertTabContext';

// Groups
import { PagesGroup } from './pages/PagesGroup';
import { TablesGroup } from './tables/TablesGroup';
import { IllustrationsGroup } from './illustrations/IllustrationsGroup';
import { AddinsGroup } from './addins/AddinsGroup';
import { MediaGroup } from './media/MediaGroup';
import { LinksGroup } from './links/LinksGroup';
import { CommentsGroup } from './comments/CommentsGroup';
import { HeaderFooterGroup } from './headerfooter/HeaderFooterGroup';
import { TextGroup } from './text/TextGroup';
import { SymbolsGroup } from './symbols/SymbolsGroup';

export const InsertTab: React.FC = () => {
  return (
    <InsertTabProvider>
       <PagesGroup />
       <RibbonSeparator />
       <TablesGroup />
       <RibbonSeparator />
       <IllustrationsGroup />
       <RibbonSeparator />
       <AddinsGroup />
       <RibbonSeparator />
       <MediaGroup />
       <RibbonSeparator />
       <LinksGroup />
       <RibbonSeparator />
       <CommentsGroup />
       <RibbonSeparator />
       <HeaderFooterGroup />
       <RibbonSeparator />
       <TextGroup />
       <RibbonSeparator />
       <SymbolsGroup />
    </InsertTabProvider>
  );
};
