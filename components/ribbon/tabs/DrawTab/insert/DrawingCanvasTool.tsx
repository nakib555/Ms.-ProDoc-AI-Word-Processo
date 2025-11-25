import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';

export const DrawingCanvasTool: React.FC = () => {
  const { executeCommand } = useEditor();
  return (
      <RibbonButton 
         icon={ImageIcon} 
         label="Drawing Canvas" 
         onClick={() => executeCommand('insertHTML', '<div style="width:100%;height:300px;border:2px dashed #ccc;background:#f8fafc;margin:1em 0;"></div>')} 
         title="Insert Drawing Canvas"
      />
  );
};