import React from 'react';
import { RibbonSection } from '../../common/RibbonSection';
import { RibbonSeparator } from '../../common/RibbonSeparator';
import { RibbonButton } from '../../common/RibbonButton';
import { 
    Trash2, Rows, Columns, Merge, 
    AlignLeft, AlignCenter, AlignRight,
    ArrowUpToLine, ArrowDownToLine
} from 'lucide-react';
import { useEditor } from '../../../../contexts/EditorContext';

const RowsColumnsGroup: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { executeCommand } = useEditor();
  
  const insertRow = (where: 'before' | 'after') => {
      // Basic DOM manipulation for table row insertion
      // Note: real implementation needs complex selection handling
      // This is a mock using standard execCommand if available or placeholder
      alert("Row insertion requires complex DOM selection handling not fully polyfilled.");
  };

  return (
    <RibbonSection title="Rows & Columns">
        <RibbonButton icon={Trash2} label="Delete" onClick={() => {}} hasArrow />
        <div className="flex flex-col gap-0.5 h-full justify-center px-1">
            <button className="flex items-center gap-2 text-[10px] px-2 py-1 hover:bg-slate-100 rounded w-full text-left whitespace-nowrap" onClick={() => insertRow('before')}>
                <ArrowUpToLine size={12} className="text-slate-500"/> Insert Above
            </button>
            <button className="flex items-center gap-2 text-[10px] px-2 py-1 hover:bg-slate-100 rounded w-full text-left whitespace-nowrap" onClick={() => insertRow('after')}>
                <ArrowDownToLine size={12} className="text-slate-500"/> Insert Below
            </button>
        </div>
        <div className="flex flex-col gap-0.5 h-full justify-center px-1 border-l border-slate-100">
            <button className="flex items-center gap-2 text-[10px] px-2 py-1 hover:bg-slate-100 rounded w-full text-left whitespace-nowrap" onClick={() => {}}>
                <ArrowUpToLine size={12} className="rotate-90 text-slate-500"/> Insert Left
            </button>
            <button className="flex items-center gap-2 text-[10px] px-2 py-1 hover:bg-slate-100 rounded w-full text-left whitespace-nowrap" onClick={() => {}}>
                <ArrowDownToLine size={12} className="rotate-90 text-slate-500"/> Insert Right
            </button>
        </div>
    </RibbonSection>
  );
};

const MergeGroup: React.FC = () => {
    return (
        <RibbonSection title="Merge">
            <RibbonButton icon={Merge} label="Merge Cells" onClick={() => {}} />
            <RibbonButton icon={Columns} label="Split Cells" onClick={() => {}} />
        </RibbonSection>
    );
};

const AlignmentGroup: React.FC = () => {
    const { applyBlockStyle } = useEditor();
    return (
        <RibbonSection title="Alignment">
            <div className="grid grid-cols-3 gap-0.5 p-1 h-full content-center">
                <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600" title="Top Left" onClick={() => applyBlockStyle({ textAlign: 'left', verticalAlign: 'top' })}><AlignLeft size={14} className="-rotate-45"/></button>
                <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600" title="Top Center" onClick={() => applyBlockStyle({ textAlign: 'center', verticalAlign: 'top' })}><AlignCenter size={14} className="-rotate-45"/></button>
                <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600" title="Top Right" onClick={() => applyBlockStyle({ textAlign: 'right', verticalAlign: 'top' })}><AlignRight size={14} className="-rotate-45"/></button>
                
                <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600" title="Center Left" onClick={() => applyBlockStyle({ textAlign: 'left', verticalAlign: 'middle' })}><AlignLeft size={14}/></button>
                <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600" title="Center" onClick={() => applyBlockStyle({ textAlign: 'center', verticalAlign: 'middle' })}><AlignCenter size={14}/></button>
                <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600" title="Center Right" onClick={() => applyBlockStyle({ textAlign: 'right', verticalAlign: 'middle' })}><AlignRight size={14}/></button>
                
                <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600" title="Bottom Left" onClick={() => applyBlockStyle({ textAlign: 'left', verticalAlign: 'bottom' })}><AlignLeft size={14} className="rotate-45"/></button>
                <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600" title="Bottom Center" onClick={() => applyBlockStyle({ textAlign: 'center', verticalAlign: 'bottom' })}><AlignCenter size={14} className="rotate-45"/></button>
                <button className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600" title="Bottom Right" onClick={() => applyBlockStyle({ textAlign: 'right', verticalAlign: 'bottom' })}><AlignRight size={14} className="rotate-45"/></button>
            </div>
        </RibbonSection>
    );
};

export const TableLayoutTab: React.FC = () => {
  return (
    <>
        <RowsColumnsGroup />
        <RibbonSeparator />
        <MergeGroup />
        <RibbonSeparator />
        <AlignmentGroup />
    </>
  );
};