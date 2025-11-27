
import React from 'react';
import { useEditor } from '../../../../../../../../contexts/EditorContext';
import { StructureButton } from '../../common/EquationTools';

const FunctionIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <text x="2" y="16" fontSize="10" fontFamily="serif" fill="currentColor">sin</text>
    <rect x="15" y="7" width="8" height="10" strokeDasharray="2 2" opacity="0.5" />
  </svg>
);

export const FunctionTool: React.FC = () => {
  const { executeCommand } = useEditor();
  return (
    <StructureButton icon={FunctionIcon} label="Function" onClick={() => executeCommand('insertHTML', 'sin(&theta;)')} hasArrow />
  );
};
