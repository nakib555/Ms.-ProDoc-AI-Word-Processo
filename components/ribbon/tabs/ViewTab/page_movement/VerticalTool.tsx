
import React from 'react';
import { MoveVertical } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';

export const VerticalTool: React.FC = () => {
  const { pageMovement, setPageMovement } = useEditor();
  
  return (
    <RibbonButton 
      icon={MoveVertical} 
      label="Vertical" 
      onClick={() => setPageMovement('vertical')} 
      className={pageMovement === 'vertical' ? "bg-slate-100 dark:bg-slate-700 text-blue-700 dark:text-blue-400 border border-slate-200 dark:border-slate-600" : ""} 
      title="Scroll pages vertically"
    />
  );
};
