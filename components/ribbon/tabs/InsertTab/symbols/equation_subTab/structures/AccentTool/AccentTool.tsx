
import React from 'react';
import { useEditor } from '../../../../../../../../contexts/EditorContext';
import { StructureButton } from '../../common/EquationTools';

const AccentIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <text x="8" y="18" fontSize="14" fontFamily="serif" fill="currentColor">a</text>
    <circle cx="12" cy="4" r="1" fill="currentColor" />
    <circle cx="15" cy="4" r="1" fill="currentColor" />
  </svg>
);

export const AccentTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const flexColCenter = "display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; margin: 0 2px;";
  const placeholder = `<span style="border: 1px dotted #94a3b8; min-width: 12px; min-height: 12px; display: inline-block; background-color: rgba(0,0,0,0.02); margin: 0 1px;">&nbsp;</span>`;
  const accentHTML = `<span style="${flexColCenter}"><span style="font-size: 0.5em;">^</span><span style="margin-top: -0.4em;">${placeholder}</span></span>&nbsp;`;

  return (
    <StructureButton icon={AccentIcon} label="Accent" onClick={() => executeCommand('insertHTML', accentHTML)} hasArrow />
  );
};
