
import React from 'react';
import { Save } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';

export const SaveTool: React.FC = () => {
  const { executeCommand } = useEditor();
  return <RibbonButton icon={Save} label="Save" onClick={() => executeCommand('save')} />;
};
