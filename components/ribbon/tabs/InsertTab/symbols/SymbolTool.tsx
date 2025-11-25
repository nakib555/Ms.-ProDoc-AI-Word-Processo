
import React from 'react';
import { Omega } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';

export const SymbolTool: React.FC = () => {
  const { executeCommand } = useEditor();
  return (
      <RibbonButton icon={Omega} label="Symbol" onClick={() => executeCommand('insertText', '™')} hasArrow />
  );
};
