import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { UndoTool } from './UndoTool';
import { RedoTool } from './RedoTool';

export const UndoGroup: React.FC = () => {
  return (
    <RibbonSection title="Undo">
       <UndoTool />
       <RedoTool />
    </RibbonSection>
  );
};