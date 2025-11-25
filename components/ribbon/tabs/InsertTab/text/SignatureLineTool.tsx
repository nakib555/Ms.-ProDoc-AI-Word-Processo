
import React from 'react';
import { PenTool } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { SmallRibbonButton } from '../common/InsertTools';

export const SignatureLineTool: React.FC = () => {
  const { executeCommand } = useEditor();
  return <SmallRibbonButton icon={PenTool} label="Signature Line" onClick={() => executeCommand('insertHTML', '<div style="margin-top:30px; width:250px; border-top:1px solid #000; padding-top:5px;">X <span style="color:#94a3b8;">Signature</span></div>')} />;
};
