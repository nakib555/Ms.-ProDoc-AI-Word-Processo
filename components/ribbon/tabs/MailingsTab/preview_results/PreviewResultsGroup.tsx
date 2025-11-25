
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { PreviewResultsTool } from './PreviewResultsTool';
import { RecordNavigationTool } from './RecordNavigationTool';
import { FindRecipientTool } from './FindRecipientTool';
import { CheckErrorsTool } from './CheckErrorsTool';

export const PreviewResultsGroup: React.FC = () => {
  return (
      <RibbonSection title="Preview Results">
         <PreviewResultsTool />
         
         <div className="flex flex-col h-full justify-center px-2 gap-1 min-w-[120px]">
             <RecordNavigationTool />
             <FindRecipientTool />
             <CheckErrorsTool />
         </div>
      </RibbonSection>
  );
};
