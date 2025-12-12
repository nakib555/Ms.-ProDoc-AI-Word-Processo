
import React, { useState, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Subscript, Superscript
} from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { ToolBtn, GroupRow } from '../common/HomeTools';

export const StandardFormattingTools: React.FC = () => {
  const { executeCommand } = useEditor();
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    subscript: false,
    superscript: false
  });

  const checkFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikethrough'),
      subscript: document.queryCommandState('subscript'),
      superscript: document.queryCommandState('superscript'),
    });
  };

  useEffect(() => {
    document.addEventListener('selectionchange', checkFormats);
    document.addEventListener('mouseup', checkFormats);
    document.addEventListener('keyup', checkFormats);
    
    return () => {
      document.removeEventListener('selectionchange', checkFormats);
      document.removeEventListener('mouseup', checkFormats);
      document.removeEventListener('keyup', checkFormats);
    };
  }, []);

  return (
    <GroupRow>
         <ToolBtn 
            icon={Bold} 
            onClick={() => { executeCommand('bold'); checkFormats(); }} 
            title="Bold (Ctrl+B)" 
            active={activeFormats.bold}
            iconClass="text-slate-800 dark:text-slate-200 font-bold"
         />
         <ToolBtn 
            icon={Italic} 
            onClick={() => { executeCommand('italic'); checkFormats(); }} 
            title="Italic (Ctrl+I)" 
            active={activeFormats.italic}
            iconClass="text-slate-700 dark:text-slate-300"
         />
         <ToolBtn 
            icon={Underline} 
            onClick={() => { executeCommand('underline'); checkFormats(); }} 
            title="Underline (Ctrl+U)" 
            active={activeFormats.underline}
            iconClass="text-slate-700 dark:text-slate-300"
         />
         <ToolBtn 
            icon={Strikethrough} 
            onClick={() => { executeCommand('strikeThrough'); checkFormats(); }} 
            title="Strikethrough" 
            active={activeFormats.strikethrough}
            iconClass="text-slate-500"
         />
         <ToolBtn 
            icon={Subscript} 
            onClick={() => { executeCommand('subscript'); checkFormats(); }} 
            title="Subscript (Ctrl+=)" 
            active={activeFormats.subscript}
            iconClass="text-violet-500"
         />
         <ToolBtn 
            icon={Superscript} 
            onClick={() => { executeCommand('superscript'); checkFormats(); }} 
            title="Superscript (Ctrl+Shift++)" 
            active={activeFormats.superscript}
            iconClass="text-violet-500"
         />
    </GroupRow>
  );
};
