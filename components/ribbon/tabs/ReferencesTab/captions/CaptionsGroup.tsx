
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { InsertCaptionTool } from './InsertCaptionTool';
import { InsertTableFiguresTool } from './InsertTableFiguresTool';
import { UpdateTableFiguresTool } from './UpdateTableFiguresTool';
import { CrossReferenceTool } from './CrossReferenceTool';

export const CaptionsGroup: React.FC = () => {
  return (
    <RibbonSection title="Captions">
        <InsertCaptionTool />
        <div className="flex flex-col justify-center gap-0 px-1 h-full">
           <InsertTableFiguresTool />
           <UpdateTableFiguresTool />
           <CrossReferenceTool />
        </div>
    </RibbonSection>
  );
};
