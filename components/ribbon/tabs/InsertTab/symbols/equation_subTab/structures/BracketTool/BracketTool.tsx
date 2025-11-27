
import React from 'react';
import { useEditor } from '../../../../../../../../contexts/EditorContext';
import { StructureButton } from '../../common/EquationTools';

const BracketIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M8 4H6v16h2" />
    <path d="M16 4h2v16h-2" />
    <rect x="9" y="7" width="6" height="10" strokeDasharray="2 2" opacity="0.5" />
  </svg>
);

export const BracketTool: React.FC = () => {
  const { executeCommand } = useEditor();
  return (
    <StructureButton icon={BracketIcon} label="Bracket" onClick={() => executeCommand('insertHTML', '(x)')} hasArrow />
  );
};
