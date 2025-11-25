
import React from 'react';
import { FilePlus } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { SmallRibbonButton } from '../common/InsertTools';

export const BlankPageTool: React.FC = () => {
  const { executeCommand } = useEditor();
  return (
    <SmallRibbonButton 
        icon={FilePlus} 
        label="Blank Page" 
        onClick={() => executeCommand('insertHTML', '<div style="page-break-before: always;"></div><p><br/></p>')} 
    />
  );
};
