import React from 'react';
import { RibbonSeparator } from '../../common/RibbonSeparator';
import { FileTabProvider } from './FileTabContext';
import { FileModal } from './FileModal';

// Groups
import { DocumentGroup } from './document/DocumentGroup';
import { SaveGroup } from './save/SaveGroup';
import { ShareGroup } from './share/ShareGroup';
import { ExportGroup } from './export/ExportGroup';

export const FileTab: React.FC = () => {
  return (
    <FileTabProvider>
      <DocumentGroup />
      <RibbonSeparator />
      <SaveGroup />
      <RibbonSeparator />
      <ShareGroup />
      <RibbonSeparator />
      <ExportGroup />
      
      {/* Modal Overlay managed by context */}
      <FileModal />
    </FileTabProvider>
  );
};