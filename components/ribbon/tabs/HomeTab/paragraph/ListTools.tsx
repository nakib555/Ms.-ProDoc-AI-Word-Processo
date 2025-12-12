
import React from 'react';
import { List, ListOrdered, ListTree } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { ToolBtn } from '../common/HomeTools';

export const ListTools: React.FC = () => {
  const { executeCommand } = useEditor();
  return (
    <>
        <ToolBtn icon={List} onClick={() => executeCommand('insertUnorderedList')} title="Bullets" iconClass="text-emerald-600" />
        <ToolBtn icon={ListOrdered} onClick={() => executeCommand('insertOrderedList')} title="Numbering" iconClass="text-emerald-600" />
        <ToolBtn icon={ListTree} onClick={() => {}} title="Multilevel List" disabled iconClass="text-emerald-500/50" />
    </>
  );
};
