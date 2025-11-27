
import React from 'react';
import { useEditor } from '../../../../../../../../contexts/EditorContext';
import { StructureButton } from '../../common/EquationTools';

const LargeOpIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M18 7V4H6v3l5 5-5 5v3h12v-3" />
  </svg>
);

export const LargeOperatorTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const flexColCenter = "display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; margin: 0 2px;";
  const placeholder = `<span style="border: 1px dotted #94a3b8; min-width: 12px; min-height: 12px; display: inline-block; background-color: rgba(0,0,0,0.02); margin: 0 1px;">&nbsp;</span>`;
  const largeOpHTML = `<span style="${flexColCenter}"><span style="font-size: 0.7em;">${placeholder}</span><span style="font-size: 1.4em; line-height: 1;">&sum;</span><span style="font-size: 0.7em;">${placeholder}</span></span>&nbsp;`;

  return (
    <StructureButton icon={LargeOpIcon} label="Large Operator" onClick={() => executeCommand('insertHTML', largeOpHTML)} hasArrow />
  );
};
