
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { CommentTool } from './CommentTool';

export const CommentsGroup: React.FC = () => {
  return (
      <RibbonSection title="Comments">
          <CommentTool />
      </RibbonSection>
  );
};
