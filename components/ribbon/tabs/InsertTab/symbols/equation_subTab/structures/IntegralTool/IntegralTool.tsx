
import React from 'react';
import { useEditor } from '../../../../../../../../contexts/EditorContext';
import { StructureButton } from '../../common/EquationTools';

const IntegralIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M12 4c-2 0-4 2-4 4v8c0 2 2 4 4 4" strokeLinecap="round" />
    <path d="M12 20c2 0 4-2 4-4V8c0-2-2-4-4-4" strokeLinecap="round" />
  </svg>
);

export const IntegralTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const flexColCenter = "display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; margin: 0 2px;";
  const flexRowCenter = "display: inline-flex; align-items: center; vertical-align: middle;";
  const placeholder = `<span style="border: 1px dotted #94a3b8; min-width: 12px; min-height: 12px; display: inline-block; background-color: rgba(0,0,0,0.02); margin: 0 1px;">&nbsp;</span>`;
  const integralHTML = `<span style="${flexRowCenter}"><span style="font-size: 1.5em;">&int;</span><span style="${flexColCenter} margin-left: -4px;"><span style="font-size: 0.7em;">${placeholder}</span><span style="font-size: 0.7em;">${placeholder}</span></span><span style="margin-left: 4px;">${placeholder}dx</span></span>&nbsp;`;

  return (
    <StructureButton icon={IntegralIcon} label="Integral" onClick={() => executeCommand('insertHTML', integralHTML)} hasArrow />
  );
};
