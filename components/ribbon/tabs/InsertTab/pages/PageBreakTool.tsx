
import React from 'react';
import { SeparatorHorizontal } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { SmallRibbonButton } from '../common/InsertTools';

export const PageBreakTool: React.FC = () => {
  const { executeCommand } = useEditor();
  return (
    <SmallRibbonButton 
        icon={SeparatorHorizontal} 
        label="Page Break" 
        onClick={() => executeCommand('insertHTML', '<div style="page-break-after: always;"></div><p><br/></p>')} 
    />
  );
};
