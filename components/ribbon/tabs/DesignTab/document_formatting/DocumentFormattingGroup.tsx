
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { ThemesTool } from './ThemesTool';
import { StyleGalleryTool } from './StyleGalleryTool';

export const DocumentFormattingGroup: React.FC = () => {
  return (
      <RibbonSection title="Document Formatting">
         <div className="flex items-center gap-2 h-full px-1">
             <ThemesTool />
             <StyleGalleryTool />
         </div>
      </RibbonSection>
  );
};
