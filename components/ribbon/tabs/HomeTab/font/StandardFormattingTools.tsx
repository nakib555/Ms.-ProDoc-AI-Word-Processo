
import React from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Subscript, Superscript
} from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { ToolBtn, GroupRow } from '../common/HomeTools';

export const StandardFormattingTools: React.FC = () => {
  const { executeCommand } = useEditor();

  return (
    <GroupRow>
         <ToolBtn icon={Bold} onClick={() => executeCommand('bold')} title="Bold (Ctrl+B)" />
         <ToolBtn icon={Italic} onClick={() => executeCommand('italic')} title="Italic (Ctrl+I)" />
         <ToolBtn icon={Underline} onClick={() => executeCommand('underline')} title="Underline (Ctrl+U)" />
         <ToolBtn icon={Strikethrough} onClick={() => executeCommand('strikeThrough')} title="Strikethrough" />
         <ToolBtn icon={Subscript} onClick={() => executeCommand('subscript')} title="Subscript (Ctrl+=)" />
         <ToolBtn icon={Superscript} onClick={() => executeCommand('superscript')} title="Superscript (Ctrl+Shift++)" />
    </GroupRow>
  );
};
