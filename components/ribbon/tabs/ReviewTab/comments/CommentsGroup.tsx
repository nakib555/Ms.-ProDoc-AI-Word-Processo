
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { NewCommentTool } from './NewCommentTool';
import { DeleteCommentTool } from './DeleteCommentTool';
import { PreviousCommentTool } from './PreviousCommentTool';
import { NextCommentTool } from './NextCommentTool';
import { ShowCommentsTool } from './ShowCommentsTool';

export const CommentsGroup: React.FC = () => {
  return (
    <RibbonSection title="Comments">
         <NewCommentTool />
         <div className="flex flex-col justify-center gap-0.5 px-1 h-full min-w-[80px]">
            <DeleteCommentTool />
            <PreviousCommentTool />
            <NextCommentTool />
         </div>
         <ShowCommentsTool />
    </RibbonSection>
  );
};
