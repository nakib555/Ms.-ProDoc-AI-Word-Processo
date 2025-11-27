
import React from 'react';
import { useEditor } from '../../../../../../../../contexts/EditorContext';
import { StructureButton } from '../../common/EquationTools';

const FractionIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <rect x="8" y="4" width="8" height="6" strokeDasharray="2 2" opacity="0.5" />
    <rect x="8" y="14" width="8" height="6" strokeDasharray="2 2" opacity="0.5" />
  </svg>
);

export const FractionTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const flexColCenter = "display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; margin: 0 2px;";
  const borderBottom = "border-bottom: 1px solid currentColor;";
  const placeholder = `<span style="border: 1px dotted #94a3b8; min-width: 12px; min-height: 12px; display: inline-block; background-color: rgba(0,0,0,0.02); margin: 0 1px;">&nbsp;</span>`;
  const fractionHTML = `<span style="${flexColCenter} vertical-align: -0.5em;"><span style="${borderBottom} padding: 0 2px;">${placeholder}</span><span style="padding: 0 2px;">${placeholder}</span></span>&nbsp;`;

  return (
    <StructureButton icon={FractionIcon} label="Fraction" onClick={() => executeCommand('insertHTML', fractionHTML)} hasArrow />
  );
};
