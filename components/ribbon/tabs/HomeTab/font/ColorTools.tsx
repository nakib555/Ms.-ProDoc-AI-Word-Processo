
import React, { useState } from 'react';
import { Highlighter, Palette } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { ToolBtn } from '../common/HomeTools';

export const ColorTools: React.FC = () => {
  const { executeCommand } = useEditor();
  const [currentColor, setCurrentColor] = useState('#ef4444'); 
  const [currentHighlight, setCurrentHighlight] = useState('#fef08a');

  return (
    <>
       <div className="flex items-center gap-0.5">
          <ToolBtn 
              icon={Highlighter} 
              onClick={() => executeCommand('backColor', currentHighlight)} 
              title="Text Highlight Color" 
              color={currentHighlight} 
          />
       </div>

       <div className="flex items-center gap-0.5">
          <ToolBtn 
              icon={Palette} 
              onClick={() => executeCommand('foreColor', currentColor)} 
              title="Font Color" 
              color={currentColor} 
          />
       </div>
    </>
  );
};
