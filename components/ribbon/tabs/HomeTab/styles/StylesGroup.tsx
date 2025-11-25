
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { StyleGallery } from './StyleGallery';
import { StyleActions } from './StyleActions';

export const StylesGroup: React.FC = () => {
  return (
    <RibbonSection title="Styles">
         <div className="flex items-start gap-1 h-full py-1">
            <StyleGallery />
            <StyleActions />
         </div>
    </RibbonSection>
  );
};
