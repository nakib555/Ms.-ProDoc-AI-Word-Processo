import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { FormatBackgroundTool } from './FormatBackgroundTool';

export const EditGroup: React.FC = () => {
  return (
    <RibbonSection title="Edit">
        <FormatBackgroundTool />
    </RibbonSection>
  );
};