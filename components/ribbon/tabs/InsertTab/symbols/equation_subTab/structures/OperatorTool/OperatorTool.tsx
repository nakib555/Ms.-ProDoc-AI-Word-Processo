
import React from 'react';
import { useEditor } from '../../../../../../../../contexts/EditorContext';
import { StructureButton } from '../../common/EquationTools';

const OperatorIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M12 18h-7l3.5-7 3.5-7 3.5 7 3.5 7z" fill="none" /> 
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </svg>
);

export const OperatorTool: React.FC = () => {
  const { executeCommand } = useEditor();
  return (
    <StructureButton icon={OperatorIcon} label="Operator" onClick={() => executeCommand('insertHTML', ' &rarr; ')} hasArrow />
  );
};
