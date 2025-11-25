import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { DrawingCanvasTool } from './DrawingCanvasTool';

export const InsertGroup: React.FC = () => {
  return (
    <RibbonSection title="Insert">
        <DrawingCanvasTool />
    </RibbonSection>
  );
};