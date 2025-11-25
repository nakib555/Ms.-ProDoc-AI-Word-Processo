
import React from 'react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { CheckboxItem } from '../common/ViewTools';

export const RulerCheckTool: React.FC = () => {
  const { showRuler, setShowRuler } = useEditor();
  return (
    <CheckboxItem label="Ruler" checked={showRuler} onChange={() => setShowRuler(!showRuler)} />
  );
};
