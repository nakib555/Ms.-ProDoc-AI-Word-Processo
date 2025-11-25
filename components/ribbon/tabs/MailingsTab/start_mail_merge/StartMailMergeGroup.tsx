
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { StartMailMergeTool } from './StartMailMergeTool';
import { SelectRecipientsTool } from './SelectRecipientsTool';
import { EditRecipientListTool } from './EditRecipientListTool';

export const StartMailMergeGroup: React.FC = () => {
  return (
      <RibbonSection title="Start Mail Merge">
         <StartMailMergeTool />
         <SelectRecipientsTool />
         <EditRecipientListTool />
      </RibbonSection>
  );
};
