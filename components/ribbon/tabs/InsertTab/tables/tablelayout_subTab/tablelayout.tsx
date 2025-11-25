import React from 'react';
import { RibbonSection } from '../../../../common/RibbonSection';
import { RibbonButton } from '../../../../common/RibbonButton';
import { 
  MousePointer2, Grid, Settings, Eraser, PenLine, Trash2, 
  ArrowUpToLine, ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine,
  Merge, Split, Scaling, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, ArrowDownAZ, Type, Calculator, TableProperties
} from 'lucide-react';
import { useEditor } from '../../../../../../contexts/EditorContext';

export const TableLayoutTab: React.FC = () => {
  const { executeCommand } = useEditor();

  const runOnCell = (fn: (cell: HTMLTableCellElement) => void) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      let node = selection.anchorNode as HTMLElement;
      while(node && node.nodeName !== 'TD' && node.nodeName !== 'TH') {
          node = node.parentNode as HTMLElement;
          if (!node || node.nodeName === 'BODY') return;
      }
      if (node) fn(node as HTMLTableCellElement);
  };

  const runOnRow = (fn: (row: HTMLTableRowElement) => void) => {
      runOnCell((cell) => {
          const row = cell.parentNode as HTMLTableRowElement;
          if (row) fn(row);
      });
  };

  const deleteRow = () => runOnRow((row) => row.remove());
  const deleteCol = () => runOnCell((cell) => {
      const row = cell.parentNode as HTMLTableRowElement;
      const table = row.parentNode?.parentNode as HTMLTableElement;
      const index = cell.cellIndex;
      if (table) {
          for (let i = 0; i < table.rows.length; i++) {
              if (table.rows[i].cells[index]) table.rows[i].deleteCell(index);
          }
      }
  });

  const insertRow = (where: 'above' | 'below') => runOnRow((row) => {
      const newRow = row.parentNode!.insertBefore(row.cloneNode(true), where === 'above' ? row : row.nextSibling);
      // Clear content of new row
      Array.from(newRow.childNodes).forEach((c: any) => c.innerHTML = '<br>');
  });

  const insertCol = (where: 'left' | 'right') => runOnCell((cell) => {
      const index = cell.cellIndex;
      const table = (cell.parentNode!.parentNode! as any).nodeName === 'TBODY' ? cell.parentNode!.parentNode!.parentNode as HTMLTableElement : cell.parentNode!.parentNode as HTMLTableElement;
      
      for (let i = 0; i < table.rows.length; i++) {
          const targetIndex = where === 'left' ? index : index + 1;
          const newCell = table.rows[i].insertCell(targetIndex);
          newCell.innerHTML = '<br>';
          newCell.style.border = '1px solid #cbd5e1';
          newCell.style.padding = '8px';
      }
  });

  const setAlign = (vertical: string, horizontal: string) => runOnCell((cell) => {
      cell.style.verticalAlign = vertical;
      cell.style.textAlign = horizontal;
  });

  return (
    <>
      <RibbonSection title="Table">
          <div className="flex h-full items-center">
              <RibbonButton icon={MousePointer2} label="Select" onClick={() => executeCommand('selectAll')} hasArrow />
              <RibbonButton icon={Grid} label="View Gridlines" onClick={() => {}} />
              <RibbonButton icon={TableProperties} label="Properties" onClick={() => alert('Table Properties')} />
          </div>
      </RibbonSection>

      <RibbonSection title="Draw">
          <div className="flex h-full items-center">
              <RibbonButton icon={PenLine} label="Draw Table" onClick={() => {}} />
              <RibbonButton icon={Eraser} label="Eraser" onClick={() => {}} />
          </div>
      </RibbonSection>

      <RibbonSection title="Rows & Columns">
          <div className="flex h-full items-center gap-1">
              <RibbonButton icon={Trash2} label="Delete" onClick={deleteRow} hasArrow />
              <div className="flex flex-col gap-0.5">
                  <button onMouseDown={(e) => e.preventDefault()} className="flex items-center gap-2 px-2 py-0.5 hover:bg-slate-100 rounded text-[10px]" onClick={() => insertRow('above')}>
                      <ArrowUpToLine size={14}/> Insert Above
                  </button>
                  <button onMouseDown={(e) => e.preventDefault()} className="flex items-center gap-2 px-2 py-0.5 hover:bg-slate-100 rounded text-[10px]" onClick={() => insertRow('below')}>
                      <ArrowDownToLine size={14}/> Insert Below
                  </button>
              </div>
              <div className="flex flex-col gap-0.5">
                  <button onMouseDown={(e) => e.preventDefault()} className="flex items-center gap-2 px-2 py-0.5 hover:bg-slate-100 rounded text-[10px]" onClick={() => insertCol('left')}>
                      <ArrowLeftToLine size={14}/> Insert Left
                  </button>
                  <button onMouseDown={(e) => e.preventDefault()} className="flex items-center gap-2 px-2 py-0.5 hover:bg-slate-100 rounded text-[10px]" onClick={() => insertCol('right')}>
                      <ArrowRightToLine size={14}/> Insert Right
                  </button>
              </div>
          </div>
      </RibbonSection>

      <RibbonSection title="Merge">
          <div className="flex flex-col h-full justify-center gap-0.5">
              <button onMouseDown={(e) => e.preventDefault()} className="flex items-center gap-2 px-2 py-0.5 hover:bg-slate-100 rounded text-[10px]" onClick={() => {}}>
                  <Merge size={14}/> Merge Cells
              </button>
              <button onMouseDown={(e) => e.preventDefault()} className="flex items-center gap-2 px-2 py-0.5 hover:bg-slate-100 rounded text-[10px]" onClick={() => {}}>
                  <Split size={14}/> Split Cells
              </button>
              <button onMouseDown={(e) => e.preventDefault()} className="flex items-center gap-2 px-2 py-0.5 hover:bg-slate-100 rounded text-[10px]" onClick={() => {}}>
                  <Split size={14} className="rotate-90"/> Split Table
              </button>
          </div>
      </RibbonSection>

      <RibbonSection title="Cell Size">
          <div className="flex h-full items-center gap-2">
              <RibbonButton icon={Scaling} label="AutoFit" onClick={() => {}} hasArrow />
              <div className="flex flex-col gap-1 text-[10px]">
                  <div className="flex items-center gap-1">
                      <span className="text-slate-500 w-8">Height:</span>
                      <input className="w-12 border rounded px-1" defaultValue='0.2"' />
                  </div>
                  <div className="flex items-center gap-1">
                      <span className="text-slate-500 w-8">Width:</span>
                      <input className="w-12 border rounded px-1" defaultValue='1.0"' />
                  </div>
              </div>
          </div>
      </RibbonSection>

      <RibbonSection title="Alignment">
          <div className="flex h-full items-center gap-2">
              {/* 3x3 Grid for Alignment */}
              <div className="grid grid-cols-3 gap-0.5 p-0.5 border rounded">
                  <button onMouseDown={(e) => e.preventDefault()} className="p-0.5 hover:bg-blue-100 rounded" onClick={() => setAlign('top', 'left')}><AlignLeft size={10} className="rotate-45"/></button>
                  <button onMouseDown={(e) => e.preventDefault()} className="p-0.5 hover:bg-blue-100 rounded" onClick={() => setAlign('top', 'center')}><AlignCenter size={10} className="-rotate-45"/></button>
                  <button onMouseDown={(e) => e.preventDefault()} className="p-0.5 hover:bg-blue-100 rounded" onClick={() => setAlign('top', 'right')}><AlignRight size={10} className="rotate-45"/></button>
                  
                  <button onMouseDown={(e) => e.preventDefault()} className="p-0.5 hover:bg-blue-100 rounded" onClick={() => setAlign('middle', 'left')}><AlignLeft size={10}/></button>
                  <button onMouseDown={(e) => e.preventDefault()} className="p-0.5 hover:bg-blue-100 rounded" onClick={() => setAlign('middle', 'center')}><AlignCenter size={10}/></button>
                  <button onMouseDown={(e) => e.preventDefault()} className="p-0.5 hover:bg-blue-100 rounded" onClick={() => setAlign('middle', 'right')}><AlignRight size={10}/></button>
                  
                  <button onMouseDown={(e) => e.preventDefault()} className="p-0.5 hover:bg-blue-100 rounded" onClick={() => setAlign('bottom', 'left')}><AlignLeft size={10} className="-rotate-45"/></button>
                  <button onMouseDown={(e) => e.preventDefault()} className="p-0.5 hover:bg-blue-100 rounded" onClick={() => setAlign('bottom', 'center')}><AlignCenter size={10} className="rotate-45"/></button>
                  <button onMouseDown={(e) => e.preventDefault()} className="p-0.5 hover:bg-blue-100 rounded" onClick={() => setAlign('bottom', 'right')}><AlignRight size={10} className="-rotate-45"/></button>
              </div>
              <div className="flex flex-col gap-0.5 text-[10px]">
                  <button onMouseDown={(e) => e.preventDefault()} className="flex items-center gap-1 px-1 hover:bg-slate-100 rounded"><Type size={12}/> Direction</button>
                  <button onMouseDown={(e) => e.preventDefault()} className="flex items-center gap-1 px-1 hover:bg-slate-100 rounded"><Settings size={12}/> Margins</button>
              </div>
          </div>
      </RibbonSection>

      <RibbonSection title="Data">
          <div className="flex flex-col h-full justify-center gap-0.5">
              <button onMouseDown={(e) => e.preventDefault()} className="flex items-center gap-2 px-2 py-0.5 hover:bg-slate-100 rounded text-[10px]" onClick={() => {}}>
                  <ArrowDownAZ size={14}/> Sort
              </button>
              <button onMouseDown={(e) => e.preventDefault()} className="flex items-center gap-2 px-2 py-0.5 hover:bg-slate-100 rounded text-[10px]" onClick={() => {}}>
                  <Type size={14}/> Convert to Text
              </button>
              <button onMouseDown={(e) => e.preventDefault()} className="flex items-center gap-2 px-2 py-0.5 hover:bg-slate-100 rounded text-[10px]" onClick={() => {}}>
                  <Calculator size={14}/> Formula
              </button>
          </div>
      </RibbonSection>
    </>
  );
};