
import React from 'react';
import { Scissors, Copy, Paintbrush } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';

export const CutCopyTools: React.FC = () => {
  const { executeCommand } = useEditor();

  return (
    <div className="flex flex-col justify-between h-full py-1">
        <button onClick={() => executeCommand('cut')} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-100 rounded text-slate-600 hover:text-blue-600 text-[11px] transition-colors text-left group">
            <Scissors size={14} className="text-rose-600 dark:text-rose-500 group-hover:scale-110 transition-transform" /> Cut
        </button>
        <button onClick={() => executeCommand('copy')} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-100 rounded text-slate-600 hover:text-blue-600 text-[11px] transition-colors text-left group">
            <Copy size={14} className="text-sky-600 dark:text-sky-500 group-hover:scale-110 transition-transform" /> Copy
        </button>
        <button onClick={() => executeCommand('formatPainter')} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-100 rounded text-slate-600 hover:text-blue-600 text-[11px] transition-colors text-left group">
            <Paintbrush size={14} className="text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform" /> Format
        </button>
    </div>
  );
};
