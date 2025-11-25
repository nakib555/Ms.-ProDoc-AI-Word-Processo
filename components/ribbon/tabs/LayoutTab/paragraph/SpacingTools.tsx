
import React from 'react';
import { ArrowUpToLine, ArrowDownToLine } from 'lucide-react';
import { ParagraphInput } from '../common/LayoutTools';

export const SpacingTools: React.FC = () => {
  return (
    <div className="flex flex-col h-full justify-center gap-1.5 py-0.5">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 text-center hidden">Spacing</div>
        <ParagraphInput label="Before" value="0 pt" icon={ArrowUpToLine} />
        <ParagraphInput label="After" value="8 pt" icon={ArrowDownToLine} />
    </div>
  );
};
