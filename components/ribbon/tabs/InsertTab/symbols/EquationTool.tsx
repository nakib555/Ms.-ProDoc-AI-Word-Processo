
import React from 'react';
import { Sigma } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';

export const EquationTool: React.FC = () => {
  const { executeCommand } = useEditor();
  return (
      <RibbonButton icon={Sigma} label="Equation" onClick={() => executeCommand('insertHTML', '<span style="font-style:italic; font-family:Times New Roman;">x = (-b ± √(b² - 4ac)) / 2a</span>')} hasArrow />
  );
};
