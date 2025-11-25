
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { FontFamilyTool } from './FontFamilyTool';
import { FontSizeTool } from './FontSizeTool';
import { FontFormattingTools } from './FontFormattingTools';
import { StandardFormattingTools } from './StandardFormattingTools';
import { TextEffectsTool } from './TextEffectsTool';
import { ColorTools } from './ColorTools';
import { FontDialogLauncher } from './FontDialogLauncher';
import { GroupRow } from '../common/HomeTools';

export const FontGroup: React.FC = () => {
  return (
    <RibbonSection title="Font">
        <div className="flex flex-col h-full justify-between py-1 px-1 gap-1 relative">
          {/* Row 1: Font Controls */}
          <GroupRow>
            <FontFamilyTool />
            <FontSizeTool />
            <FontFormattingTools />
          </GroupRow>

          {/* Row 2: Styles & Colors */}
          <GroupRow>
             <StandardFormattingTools />
             <TextEffectsTool />
             <ColorTools />
          </GroupRow>
          
          <FontDialogLauncher />
        </div>
    </RibbonSection>
  );
};
