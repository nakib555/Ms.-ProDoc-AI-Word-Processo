
import React from 'react';
import { Indent, Outdent } from 'lucide-react';
import { ParagraphInput } from '../common/LayoutTools';

export const IndentTools: React.FC = () => {
  return (
    <div className="flex flex-col h-full justify-center gap-1.5 py-0.5">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 text-center hidden">Indent</div>
        <ParagraphInput label="Left" value="0 cm" icon={Indent} />
        <ParagraphInput label="Right" value="0 cm" icon={Outdent} />
    </div>
  );
};
