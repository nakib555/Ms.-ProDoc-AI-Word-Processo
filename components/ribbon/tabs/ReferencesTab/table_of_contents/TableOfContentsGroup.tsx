
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { TableOfContentsTool } from './TableOfContentsTool';
import { AddTextTool } from './AddTextTool';
import { UpdateTableTool } from './UpdateTableTool';

export const TableOfContentsGroup: React.FC = () => {
  return (
    <RibbonSection title="Table of Contents">
       <TableOfContentsTool />
       <div className="flex flex-col justify-center gap-0.5 px-1 h-full min-w-[80px]">
           <AddTextTool />
           <UpdateTableTool />
       </div>
    </RibbonSection>
  );
};
