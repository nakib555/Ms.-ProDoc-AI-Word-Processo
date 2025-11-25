
import React from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';

export const CommentTool: React.FC = () => {
  const { executeCommand } = useEditor();

  const insertComment = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
          const text = selection.toString();
          executeCommand('insertHTML', `<span style="background-color: #fef9c3; border-bottom: 2px solid #eab308; padding: 1px 2px;" title="Comment by Author">${text}</span>`);
      } else {
          executeCommand('insertHTML', '<span style="color: #eab308; background: #fffbeb; padding: 2px 4px; border: 1px solid #eab308; border-radius: 4px; font-size: 0.9em;">💬 [Comment]</span>&nbsp;');
      }
  };

  return (
      <RibbonButton icon={MessageSquarePlus} label="Comment" onClick={insertComment} />
  );
};
