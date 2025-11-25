import React, { useState } from 'react';
import { RibbonSection } from '../../../../common/RibbonSection';
import { RibbonButton } from '../../../../common/RibbonButton';
import { CheckboxItem, SmallRibbonButton } from '../../../ViewTab/common/ViewTools';
import { PaintBucket, PenTool, Grid, LayoutGrid, ChevronDown } from 'lucide-react';
import { useEditor } from '../../../../../../contexts/EditorContext';

const COLORS = ['#ffffff', '#000000', '#e2e8f0', '#cbd5e1', '#94a3b8', '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];

export const TableDesignTab: React.FC = () => {
  const { applyBlockStyle } = useEditor();
  const [options, setOptions] = useState({
    headerRow: true,
    firstColumn: true,
    totalRow: false,
    lastColumn: false,
    bandedRows: true,
    bandedCols: false,
  });

  const handleShading = (color: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    let node = selection.anchorNode as HTMLElement;
    while(node && node.nodeName !== 'TD' && node.nodeName !== 'TH') {
        node = node.parentNode as HTMLElement;
    }
    
    if (node && (node.nodeName === 'TD' || node.nodeName === 'TH')) {
        node.style.backgroundColor = color;
    }
  };

  const handleBorder = (style: React.CSSProperties) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    // Apply to table cell
    let node = selection.anchorNode as HTMLElement;
    while(node && node.nodeName !== 'TD' && node.nodeName !== 'TH') {
        node = node.parentNode as HTMLElement;
    }
    if (node) Object.assign(node.style, style);
  };

  return (
    <>
      <RibbonSection title="Table Style Options">
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 px-1 h-full items-center">
            <CheckboxItem label="Header Row" checked={options.headerRow} onChange={() => setOptions(p => ({...p, headerRow: !p.headerRow}))} />
            <CheckboxItem label="First Column" checked={options.firstColumn} onChange={() => setOptions(p => ({...p, firstColumn: !p.firstColumn}))} />
            <CheckboxItem label="Total Row" checked={options.totalRow} onChange={() => setOptions(p => ({...p, totalRow: !p.totalRow}))} />
            <CheckboxItem label="Last Column" checked={options.lastColumn} onChange={() => setOptions(p => ({...p, lastColumn: !p.lastColumn}))} />
            <CheckboxItem label="Banded Rows" checked={options.bandedRows} onChange={() => setOptions(p => ({...p, bandedRows: !p.bandedRows}))} />
            <CheckboxItem label="Banded Columns" checked={options.bandedCols} onChange={() => setOptions(p => ({...p, bandedCols: !p.bandedCols}))} />
        </div>
      </RibbonSection>

      <RibbonSection title="Table Styles">
         <div className="flex items-center gap-1 h-full px-1 overflow-x-auto no-scrollbar max-w-[300px]">
             {/* Style Previews */}
             <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyBlockStyle({borderCollapse:'collapse', border:'1px solid #000'})} className="h-14 w-16 border border-slate-300 bg-white hover:ring-2 ring-blue-400 grid grid-rows-4 p-1 gap-[1px]">
                 <div className="bg-slate-800 row-span-1"></div>
                 <div className="bg-slate-100 row-span-1"></div>
                 <div className="bg-white row-span-1"></div>
                 <div className="bg-slate-100 row-span-1"></div>
             </button>
             <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyBlockStyle({borderCollapse:'collapse', border:'none'})} className="h-14 w-16 border border-slate-300 bg-white hover:ring-2 ring-blue-400 grid grid-rows-4 p-1 gap-[1px]">
                 <div className="bg-blue-600 row-span-1"></div>
                 <div className="bg-blue-50 row-span-1"></div>
                 <div className="bg-white row-span-1"></div>
                 <div className="bg-blue-50 row-span-1"></div>
             </button>
             <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyBlockStyle({borderCollapse:'collapse', border:'2px solid #333'})} className="h-14 w-16 border border-slate-300 bg-white hover:ring-2 ring-blue-400 grid grid-rows-4 p-1 gap-[1px]">
                 <div className="bg-orange-500 row-span-1"></div>
                 <div className="bg-orange-50 row-span-1"></div>
                 <div className="bg-white row-span-1"></div>
                 <div className="bg-orange-50 row-span-1"></div>
             </button>
             <button onMouseDown={(e) => e.preventDefault()} className="h-full w-6 flex items-center justify-center hover:bg-slate-100 rounded">
                 <ChevronDown size={12} />
             </button>
         </div>
      </RibbonSection>

      <RibbonSection title="Borders">
          <div className="flex items-center gap-2 h-full px-1">
              <div className="flex flex-col gap-1">
                  <button onMouseDown={(e) => e.preventDefault()} className="flex items-center gap-2 px-1 py-0.5 hover:bg-slate-100 rounded text-xs" onClick={() => {}}>
                      <PaintBucket size={14} className="text-blue-600"/> 
                      <span className="text-[10px]">Shading</span>
                      <div className="w-12 h-3 flex gap-[1px] ml-1">
                          {COLORS.slice(0, 5).map(c => (
                              <div key={c} className="w-2 h-full cursor-pointer hover:scale-125 transition-transform" style={{background: c}} onMouseDown={(e) => e.preventDefault()} onClick={(e) => {e.stopPropagation(); handleShading(c)}} />
                          ))}
                      </div>
                  </button>
                  <div className="flex items-center gap-1 border p-0.5 rounded bg-white">
                      <div className="w-8 h-[1px] bg-black"></div>
                      <ChevronDown size={10} />
                  </div>
                  <div className="flex items-center gap-1 border p-0.5 rounded bg-white">
                      <span className="text-[10px]">½ pt</span>
                      <ChevronDown size={10} />
                  </div>
              </div>
              
              <div className="flex flex-col items-center justify-center px-2 border-l border-slate-100">
                  <RibbonButton icon={LayoutGrid} label="Borders" onClick={() => handleBorder({border: '1px solid black'})} hasArrow />
              </div>
              
              <div className="flex flex-col items-center justify-center px-2 border-l border-slate-100">
                  <RibbonButton icon={PenTool} label="Border Painter" onClick={() => {}} />
              </div>
          </div>
      </RibbonSection>
    </>
  );
};