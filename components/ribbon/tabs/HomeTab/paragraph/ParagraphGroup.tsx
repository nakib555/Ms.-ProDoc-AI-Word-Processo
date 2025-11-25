
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { ListTools } from './ListTools';
import { IndentTools } from './IndentTools';
import { AlignmentTools } from './AlignmentTools';
import { SpacingTool } from './SpacingTool';
import { BordersShadingTools } from './BordersShadingTools';
import { GroupRow } from '../common/HomeTools';

export const ParagraphGroup: React.FC = () => {
  return (
    <RibbonSection title="Paragraph">
        <div className="flex flex-col h-full justify-between py-1 px-1 gap-1">
          <GroupRow>
             <ListTools />
             <IndentTools />
          </GroupRow>
          <GroupRow>
             <AlignmentTools />
             <SpacingTool />
             <BordersShadingTools />
          </GroupRow>
        </div>
    </RibbonSection>
  );
};
