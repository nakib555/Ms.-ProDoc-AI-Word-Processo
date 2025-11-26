
import React from 'react';
import { Sigma } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';

export const EquationTool: React.FC = () => {
  const { executeCommand } = useEditor();

  const insertEquation = () => {
      // Insert a styled span that acts as the equation box
      const html = `&nbsp;<span class="prodoc-equation" style="display: inline-block; border: 1px solid #cbd5e1; background-color: #f8fafc; padding: 4px 8px; margin: 0 2px; border-radius: 2px; min-width: 20px; text-align: center;"><span style="font-family: 'Cambria Math', 'Times New Roman', serif; font-style: italic; color: #64748b;">Type equation here.</span></span>&nbsp;`;
      executeCommand('insertHTML', html);
  };

  return (
      <RibbonButton 
        icon={Sigma} 
        label="Equation" 
        onClick={insertEquation} 
        hasArrow 
      />
  );
};
