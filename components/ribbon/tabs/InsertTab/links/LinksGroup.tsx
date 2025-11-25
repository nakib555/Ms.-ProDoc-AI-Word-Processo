
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { LinkTool } from './LinkTool';
import { BookmarkTool } from './BookmarkTool';
import { CrossRefTool } from './CrossRefTool';

export const LinksGroup: React.FC = () => {
  return (
      <RibbonSection title="Links">
         <LinkTool />
         <div className="flex flex-col justify-center gap-0.5 px-0.5 border-l border-slate-100 ml-1 pl-1">
             <BookmarkTool />
             <CrossRefTool />
         </div>
      </RibbonSection>
  );
};
