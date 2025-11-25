
import React from 'react';
import { 
  CaseUpper, Eraser 
} from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { ToolBtn } from '../common/HomeTools';

export const FontFormattingTools: React.FC = () => {
  const { executeCommand } = useEditor();

  const handleChangeCase = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const text = selection.toString();
    if (text) {
        const isUpper = text === text.toUpperCase();
        const isLower = text === text.toLowerCase();
        
        let newText = text;
        if (isUpper) newText = text.toLowerCase();
        else if (isLower) newText = text.replace(/\b\w/g, c => c.toUpperCase());
        else newText = text.toUpperCase();

        document.execCommand('insertText', false, newText);
    }
  };

  return (
    <>
        <div className="w-[1px] h-4 bg-slate-200 mx-1" />
        <ToolBtn icon={CaseUpper} onClick={handleChangeCase} title="Change Case" />
        <ToolBtn icon={Eraser} onClick={() => executeCommand('removeFormat')} title="Clear All Formatting" className="text-pink-600 hover:text-pink-700" />
    </>
  );
};
