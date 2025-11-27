
import React from 'react';
import { useEditor } from '../../../../../../../../contexts/EditorContext';
import { StructureButton } from '../../common/EquationTools';

const RadicalIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M4 14h3l3 7L16 4h6" />
    <rect x="12" y="8" width="8" height="8" strokeDasharray="2 2" opacity="0.5" stroke="none" fill="currentColor" fillOpacity="0.1" />
  </svg>
);

export const RadicalTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const flexRowCenter = "display: inline-flex; align-items: center; vertical-align: middle;";
  const placeholder = `<span style="border: 1px dotted #94a3b8; min-width: 12px; min-height: 12px; display: inline-block; background-color: rgba(0,0,0,0.02); margin: 0 1px;">&nbsp;</span>`;
  const radicalHTML = `<span style="${flexRowCenter}"><span style="font-size: 1.5em; line-height: 1;">&radic;</span><span style="border-top: 1px solid currentColor; padding-top: 2px; margin-left: -2px;">${placeholder}</span></span>&nbsp;`;

  return (
    <StructureButton icon={RadicalIcon} label="Radical" onClick={() => executeCommand('insertHTML', radicalHTML)} hasArrow />
  );
};
