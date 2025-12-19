
import React from 'react';
import { Type } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { SmallRibbonButton } from '../common/InsertTools';

export const DropCapTool: React.FC = () => {
  const { executeCommand } = useEditor();
  return <SmallRibbonButton icon={Type} label="Drop Cap" onClick={() => executeCommand('insertHTML', '<span style="float:left; font-size:3.5em; line-height:0.8; padding-right:0.1em; color:#1e293b;">L</span>')} iconClassName="text-slate-800 dark:text-slate-200" />;
};
