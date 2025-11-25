
import React from 'react';
import { Calendar } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { SmallRibbonButton } from '../common/InsertTools';

export const DateTimeTool: React.FC = () => {
  const { executeCommand } = useEditor();
  return <SmallRibbonButton icon={Calendar} label="Date & Time" onClick={() => executeCommand('insertText', new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString())} />;
};
