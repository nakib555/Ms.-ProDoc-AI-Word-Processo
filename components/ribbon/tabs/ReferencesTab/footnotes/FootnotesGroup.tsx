
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { InsertFootnoteTool } from './InsertFootnoteTool';
import { InsertEndnoteTool } from './InsertEndnoteTool';
import { NextFootnoteTool } from './NextFootnoteTool';
import { ShowNotesTool } from './ShowNotesTool';

export const FootnotesGroup: React.FC = () => {
  return (
    <RibbonSection title="Footnotes">
       <div className="flex items-center h-full">
           <InsertFootnoteTool />
           <div className="flex flex-col justify-center gap-0 px-1 h-full">
               <InsertEndnoteTool />
               <NextFootnoteTool />
               <ShowNotesTool />
           </div>
       </div>
    </RibbonSection>
  );
};
