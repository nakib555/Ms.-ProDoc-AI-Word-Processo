
import React from 'react';
import { List, ListOrdered, ListTree } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { ToolBtn } from '../common/HomeTools';

export const ListTools: React.FC = () => {
  const { executeCommand } = useEditor();
  return (
    <>
        <ToolBtn icon={List} onClick={() => executeCommand('insertUnorderedList')} title="Bullets" iconClass="text-indigo-600 dark:text-indigo-400" />
        <ToolBtn icon={ListOrdered} onClick={() => executeCommand('insertOrderedList')} title="Numbering" iconClass="text-blue-600 dark:text-blue-400" />
        <ToolBtn icon={ListTree} onClick={() => {}} title="Multilevel List" disabled iconClass="text-cyan-600 dark:text-cyan-400 opacity-50" />
    </>
  );
};
