import React from 'react';
import { RibbonSeparator } from '../../common/RibbonSeparator';
import { DrawTabProvider } from './DrawTabContext';

// Groups
import { UndoGroup } from './undo/UndoGroup';
import { DrawingToolsGroup } from './drawing_tools/DrawingToolsGroup';
import { PensGroup } from './pens/PensGroup';
import { StencilsGroup } from './stencils/StencilsGroup';
import { EditGroup } from './edit/EditGroup';
import { ConvertGroup } from './convert/ConvertGroup';
import { InsertGroup } from './insert/InsertGroup';
import { ReplayGroup } from './replay/ReplayGroup';

export const DrawTab: React.FC = () => {
  return (
    <DrawTabProvider>
        <UndoGroup />
        <RibbonSeparator />
        <DrawingToolsGroup />
        <RibbonSeparator />
        <PensGroup />
        <RibbonSeparator />
        <StencilsGroup />
        <RibbonSeparator />
        <EditGroup />
        <RibbonSeparator />
        <ConvertGroup />
        <RibbonSeparator />
        <InsertGroup />
        <RibbonSeparator />
        <ReplayGroup />
    </DrawTabProvider>
  );
};