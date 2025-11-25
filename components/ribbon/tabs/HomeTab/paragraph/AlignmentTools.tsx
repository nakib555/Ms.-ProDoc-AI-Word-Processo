
import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { ToolBtn } from '../common/HomeTools';

export const AlignmentTools: React.FC = () => {
  const { executeCommand } = useEditor();
  return (
    <>
         <ToolBtn icon={AlignLeft} onClick={() => executeCommand('justifyLeft')} title="Align Left (Ctrl+L)" />
         <ToolBtn icon={AlignCenter} onClick={() => executeCommand('justifyCenter')} title="Center (Ctrl+E)" />
         <ToolBtn icon={AlignRight} onClick={() => executeCommand('justifyRight')} title="Align Right (Ctrl+R)" />
         <ToolBtn icon={AlignJustify} onClick={() => executeCommand('justifyFull')} title="Justify (Ctrl+J)" />
    </>
  );
};
