
import React from 'react';
import { MousePointer2 } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';

export const SelectTool: React.FC = () => {
  const { executeCommand } = useEditor();
  return (
    <button className="flex items-center px-2 py-0.5 hover:bg-slate-100 rounded text-slate-600 hover:text-blue-600 text-[11px] transition-colors group text-left" onClick={() => executeCommand('selectAll')}>
       <MousePointer2 className="w-3.5 h-3.5 mr-2 text-indigo-500 dark:text-indigo-400 group-hover:text-indigo-600" /> Select
    </button>
  );
};
