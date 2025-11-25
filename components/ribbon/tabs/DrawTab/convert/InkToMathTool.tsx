import React from 'react';
import { Pi } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';

export const InkToMathTool: React.FC = () => {
  const { executeCommand } = useEditor();
  return (
    <RibbonButton 
       icon={Pi} 
       label="Ink to Math" 
       onClick={() => executeCommand('insertHTML', '<span class="math-ink" style="font-family:Cambria Math; font-size:1.2em;">&int;<sub>0</sub><sup>&infin;</sup> f(x) dx</span>')} 
    />
  );
};