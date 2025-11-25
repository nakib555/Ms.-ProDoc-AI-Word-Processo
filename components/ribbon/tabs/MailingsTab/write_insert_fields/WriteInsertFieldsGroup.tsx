
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { HighlightMergeFieldsTool } from './HighlightMergeFieldsTool';
import { AddressBlockTool } from './AddressBlockTool';
import { GreetingLineTool } from './GreetingLineTool';
import { InsertMergeFieldTool } from './InsertMergeFieldTool';
import { RulesTool } from './RulesTool';
import { MatchFieldsTool } from './MatchFieldsTool';
import { UpdateLabelsTool } from './UpdateLabelsTool';

export const WriteInsertFieldsGroup: React.FC = () => {
  return (
      <RibbonSection title="Write & Insert Fields">
         <HighlightMergeFieldsTool />
         <AddressBlockTool />
         <GreetingLineTool />
         <InsertMergeFieldTool />
         
         <div className="flex flex-col justify-center gap-0.5 px-1 h-full min-w-[100px]">
             <RulesTool />
             <MatchFieldsTool />
             <UpdateLabelsTool />
         </div>
      </RibbonSection>
  );
};
