
import React from 'react';
import { useEditor } from '../../../../../../../../contexts/EditorContext';
import { StructureButton } from '../../common/EquationTools';

const MatrixIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <rect x="4" y="4" width="6" height="6" strokeDasharray="2 2" opacity="0.5" />
    <rect x="14" y="4" width="6" height="6" strokeDasharray="2 2" opacity="0.5" />
    <rect x="4" y="14" width="6" height="6" strokeDasharray="2 2" opacity="0.5" />
    <rect x="14" y="14" width="6" height="6" strokeDasharray="2 2" opacity="0.5" />
  </svg>
);

export const MatrixTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const flexRowCenter = "display: inline-flex; align-items: center; vertical-align: middle;";
  const placeholder = `<span style="border: 1px dotted #94a3b8; min-width: 12px; min-height: 12px; display: inline-block; background-color: rgba(0,0,0,0.02); margin: 0 1px;">&nbsp;</span>`;
  const matrixHTML = `<span style="${flexRowCenter}"><span style="font-size: 2.5em; font-weight: lighter;">[</span><span style="display: inline-grid; grid-template-columns: 1fr 1fr; gap: 4px 8px; margin: 0 4px; text-align: center;"><span>${placeholder}</span><span>${placeholder}</span><span>${placeholder}</span><span>${placeholder}</span></span><span style="font-size: 2.5em; font-weight: lighter;">]</span></span>&nbsp;`;

  return (
    <StructureButton icon={MatrixIcon} label="Matrix" onClick={() => executeCommand('insertHTML', matrixHTML)} hasArrow />
  );
};
