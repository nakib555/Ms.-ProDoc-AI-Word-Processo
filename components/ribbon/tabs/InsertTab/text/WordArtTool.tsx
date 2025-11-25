
import React from 'react';
import { Baseline } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { SmallRibbonButton } from '../common/InsertTools';

export const WordArtTool: React.FC = () => {
  const { executeCommand } = useEditor();
  return <SmallRibbonButton icon={Baseline} label="WordArt" onClick={() => executeCommand('insertHTML', '<span style="font-family:Impact; font-size:24px; color:#2563eb; text-shadow: 2px 2px 0 #cbd5e1; letter-spacing: 1px;">WordArt</span>')} />;
};
