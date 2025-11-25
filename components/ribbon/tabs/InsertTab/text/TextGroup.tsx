
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { TextBoxTool } from './TextBoxTool';
import { QuickPartsTool } from './QuickPartsTool';
import { WordArtTool } from './WordArtTool';
import { DropCapTool } from './DropCapTool';
import { SignatureLineTool } from './SignatureLineTool';
import { DateTimeTool } from './DateTimeTool';
import { ObjectTool } from './ObjectTool';

export const TextGroup: React.FC = () => {
  return (
      <RibbonSection title="Text">
         <TextBoxTool />
         
         <div className="grid grid-cols-2 gap-x-1 gap-y-0 content-center px-1 border-l border-slate-100 ml-1">
            <div className="flex flex-col gap-0">
                <QuickPartsTool />
                <WordArtTool />
                <DropCapTool />
            </div>
            <div className="flex flex-col gap-0">
                <SignatureLineTool />
                <DateTimeTool />
                <ObjectTool />
            </div>
         </div>
      </RibbonSection>
  );
};
