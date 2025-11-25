
import React from 'react';
import { RibbonSeparator } from '../../common/RibbonSeparator';
import { ReferencesTabProvider } from './ReferencesTabContext';

// Groups
import { TableOfContentsGroup } from './table_of_contents/TableOfContentsGroup';
import { FootnotesGroup } from './footnotes/FootnotesGroup';
import { CitationsBibliographyGroup } from './citations_bibliography/CitationsBibliographyGroup';
import { CaptionsGroup } from './captions/CaptionsGroup';
import { IndexGroup } from './index_group/IndexGroup';
import { TableOfAuthoritiesGroup } from './table_of_authorities/TableOfAuthoritiesGroup';

export const ReferencesTab: React.FC = () => {
  return (
    <ReferencesTabProvider>
        <TableOfContentsGroup />
        <RibbonSeparator />
        <FootnotesGroup />
        <RibbonSeparator />
        <CitationsBibliographyGroup />
        <RibbonSeparator />
        <CaptionsGroup />
        <RibbonSeparator />
        <IndexGroup />
        <RibbonSeparator />
        <TableOfAuthoritiesGroup />
    </ReferencesTabProvider>
  );
};
