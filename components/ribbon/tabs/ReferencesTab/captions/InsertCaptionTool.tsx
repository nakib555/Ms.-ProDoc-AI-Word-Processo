
import React from 'react';
import { Subtitles } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';

export const InsertCaptionTool: React.FC = () => {
  const { executeCommand } = useEditor();
  return (
      <RibbonButton 
        icon={Subtitles} 
        label="Insert Caption" 
        onClick={() => executeCommand('insertHTML', '<div style="text-align:center; font-style:italic; font-size:0.9em; color:#64748b; margin-top:4px;">Figure 1: Description</div>')} 
        title="Insert Caption"
      />
  );
};
