
import React from 'react';
import { MoveHorizontal } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';

export const SideToSideTool: React.FC = () => {
  const { pageMovement, setPageMovement } = useEditor();

  return (
    <RibbonButton 
        icon={MoveHorizontal} 
        label="Side to Side" 
        onClick={() => setPageMovement('side-to-side')} 
        className={pageMovement === 'side-to-side' ? "bg-slate-100 dark:bg-slate-700 text-blue-700 dark:text-blue-400 border border-slate-200 dark:border-slate-600" : ""}
        title="View pages side by side"
    />
  );
};
