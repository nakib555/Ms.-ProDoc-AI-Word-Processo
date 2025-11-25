import React from 'react';
import { BookOpen } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';

export const ReadModeTool: React.FC = () => {
  const { setViewMode } = useEditor();
  return (
    <RibbonButton 
        icon={BookOpen} 
        label="Read Mode" 
        onClick={() => setViewMode('read')}
        title="Switch to distraction-free Read Mode"
    />
  );
};