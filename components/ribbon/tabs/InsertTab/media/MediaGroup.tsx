
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { OnlineVideoTool } from './OnlineVideoTool';

export const MediaGroup: React.FC = () => {
  return (
      <RibbonSection title="Media">
         <OnlineVideoTool />
      </RibbonSection>
  );
};
