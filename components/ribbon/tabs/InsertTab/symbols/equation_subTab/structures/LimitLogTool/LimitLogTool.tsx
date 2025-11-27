
import React from 'react';
import { useEditor } from '../../../../../../../../contexts/EditorContext';
import { StructureButton } from '../../common/EquationTools';

const LimitIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <text x="4" y="12" fontSize="10" fontFamily="serif" fill="currentColor">lim</text>
    <rect x="4" y="14" width="16" height="6" strokeDasharray="2 2" opacity="0.5" />
  </svg>
);

export const LimitLogTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const flexColCenter = "display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; margin: 0 2px;";
  const limitHTML = `<span style="${flexColCenter} margin-right: 4px;"><span style="font-family: 'Times New Roman', serif;">lim</span><span style="font-size: 0.7em;">n&rarr;&infin;</span></span>&nbsp;`;

  return (
    <StructureButton icon={LimitIcon} label="Limit and Log" onClick={() => executeCommand('insertHTML', limitHTML)} hasArrow />
  );
};
