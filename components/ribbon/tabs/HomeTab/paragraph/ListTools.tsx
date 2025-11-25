
import React from 'react';
import { List, ListOrdered, ListTree } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { ToolBtn } from '../common/HomeTools';

export const ListTools: React.FC = () => {
  const { executeCommand } = useEditor();
  return (
    <>
        <ToolBtn icon={List} onClick={() => executeCommand('insertUnorderedList')} title="Bullets" />
        <ToolBtn icon={ListOrdered} onClick={() => executeCommand('insertOrderedList')} title="Numbering" />
        <ToolBtn icon={ListTree} onClick={() => {}} title="Multilevel List" disabled />
    </>
  );
};
