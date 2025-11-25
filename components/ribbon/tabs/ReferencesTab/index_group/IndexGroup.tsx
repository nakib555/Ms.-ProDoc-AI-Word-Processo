
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { MarkEntryTool } from './MarkEntryTool';
import { InsertIndexTool } from './InsertIndexTool';
import { UpdateIndexTool } from './UpdateIndexTool';

export const IndexGroup: React.FC = () => {
  return (
    <RibbonSection title="Index">
        <MarkEntryTool />
        <div className="flex flex-col justify-center gap-0.5 px-1 h-full">
           <InsertIndexTool />
           <UpdateIndexTool />
        </div>
    </RibbonSection>
  );
};
