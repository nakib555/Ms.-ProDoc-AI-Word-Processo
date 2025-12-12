
import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { ToolBtn } from '../common/HomeTools';

export const AlignmentTools: React.FC = () => {
  const { executeCommand } = useEditor();
  return (
    <>
         <ToolBtn icon={AlignLeft} onClick={() => executeCommand('justifyLeft')} title="Align Left (Ctrl+L)" iconClass="text-slate-700" />
         <ToolBtn icon={AlignCenter} onClick={() => executeCommand('justifyCenter')} title="Center (Ctrl+E)" iconClass="text-slate-700" />
         <ToolBtn icon={AlignRight} onClick={() => executeCommand('justifyRight')} title="Align Right (Ctrl+R)" iconClass="text-slate-700" />
         <ToolBtn icon={AlignJustify} onClick={() => executeCommand('justifyFull')} title="Justify (Ctrl+J)" iconClass="text-slate-700" />
    </>
  );
};
