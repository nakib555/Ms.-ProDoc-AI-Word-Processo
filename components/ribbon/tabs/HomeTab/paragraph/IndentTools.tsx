
import React from 'react';
import { Indent, Outdent, Pilcrow, ArrowDownAZ } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { ToolBtn } from '../common/HomeTools';

export const IndentTools: React.FC = () => {
  const { executeCommand, showFormattingMarks, setShowFormattingMarks } = useEditor();
  return (
    <>
        <div className="w-[1px] h-4 bg-slate-200 mx-1" />
        <ToolBtn icon={Outdent} onClick={() => executeCommand('outdent')} title="Decrease Indent" iconClass="text-blue-500" />
        <ToolBtn icon={Indent} onClick={() => executeCommand('indent')} title="Increase Indent" iconClass="text-blue-500" />
        <div className="w-[1px] h-4 bg-slate-200 mx-1" />
        <ToolBtn icon={ArrowDownAZ} onClick={() => {}} title="Sort" disabled iconClass="text-slate-400" />
        <ToolBtn 
            icon={Pilcrow} 
            onClick={() => setShowFormattingMarks(!showFormattingMarks)} 
            title="Show/Hide ¶" 
            active={showFormattingMarks} 
            iconClass="text-slate-600"
        />
    </>
  );
};
