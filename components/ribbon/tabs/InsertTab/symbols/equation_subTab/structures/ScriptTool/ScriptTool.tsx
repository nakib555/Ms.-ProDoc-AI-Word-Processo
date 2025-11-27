
import React from 'react';
import { useEditor } from '../../../../../../../../contexts/EditorContext';
import { StructureButton } from '../../common/EquationTools';

const ScriptIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <rect x="4" y="10" width="10" height="10" strokeDasharray="2 2" opacity="0.5" />
    <rect x="16" y="4" width="6" height="6" strokeDasharray="2 2" opacity="0.5" />
  </svg>
);

export const ScriptTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const placeholder = `<span style="border: 1px dotted #94a3b8; min-width: 12px; min-height: 12px; display: inline-block; background-color: rgba(0,0,0,0.02); margin: 0 1px;">&nbsp;</span>`;
  const scriptHTML = `${placeholder}<sup>${placeholder}</sup>`;

  return (
    <StructureButton icon={ScriptIcon} label="Script" onClick={() => executeCommand('insertHTML', scriptHTML)} hasArrow />
  );
};
