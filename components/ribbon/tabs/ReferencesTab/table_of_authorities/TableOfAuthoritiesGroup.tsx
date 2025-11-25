
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { MarkCitationTool } from './MarkCitationTool';
import { InsertTableAuthoritiesTool } from './InsertTableAuthoritiesTool';
import { UpdateTableAuthoritiesTool } from './UpdateTableAuthoritiesTool';

export const TableOfAuthoritiesGroup: React.FC = () => {
  return (
    <RibbonSection title="Table of Authorities">
        <MarkCitationTool />
        <div className="flex flex-col justify-center gap-0.5 px-1 h-full">
           <InsertTableAuthoritiesTool />
           <UpdateTableAuthoritiesTool />
        </div>
    </RibbonSection>
  );
};
