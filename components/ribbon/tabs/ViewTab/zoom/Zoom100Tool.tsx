
import React from 'react';
import { ZoomIn } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';

export const Zoom100Tool: React.FC = () => {
  const { executeCommand } = useEditor();
  return <RibbonButton icon={ZoomIn} label="100%" onClick={() => executeCommand('zoomReset')} />;
};
