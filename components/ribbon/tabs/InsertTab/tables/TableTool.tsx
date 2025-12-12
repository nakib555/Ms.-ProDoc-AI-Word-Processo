
import React from 'react';
import { Table, TableProperties, PenLine } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useInsertTab } from '../InsertTabContext';
import { DropdownButton } from '../common/InsertTools';
import { MenuPortal } from '../../../common/MenuPortal';
import { TableGridPicker } from './TableGridPicker';

export const TableTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useInsertTab();

  const handleTableInsert = (rows: number, cols: number) => {
    if(rows > 0 && cols > 0) {
        // Removed table-level border to prevent "shifted line" artifacts during zoom/scaling. 
        // Cell borders define the grid.
        let html = '<table style="width: 100%; border-collapse: collapse; margin: 1em 0;"><thead><tr>';
        for(let c=0; c<cols; c++) html += `<th style="border: 1px solid #cbd5e1; padding: 8px; background: #f1f5f9; text-align: left; font-weight: 600;">Header ${c+1}</th>`;
        html += '</tr></thead><tbody>';
        for(let r=0; r<rows; r++) {
            html += '<tr>';
            for(let c=0; c<cols; c++) html += `<td style="border: 1px solid #cbd5e1; padding: 8px;">Cell</td>`;
            html += '</tr>';
        }
        html += '</tbody></table><p><br/></p>';
        executeCommand('insertHTML', html);
    }
    closeMenu();
  };

  return (
    <>
         <DropdownButton 
             id="table_menu" 
             icon={Table} 
             label="Table" 
             iconClassName="text-blue-600"
         />
         <MenuPortal id="table_menu" activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width="auto">
             <TableGridPicker onInsert={handleTableInsert} />
             <div className="border-t border-slate-100 mt-1 pt-1">
                 <button className="w-full text-left px-3 py-2 hover:bg-slate-100 text-xs text-slate-700 flex items-center gap-2" onClick={() => { alert("Insert Table Dialog"); closeMenu(); }}>
                    <TableProperties size={14} className="text-slate-500"/> Insert Table...
                 </button>
                 <button className="w-full text-left px-3 py-2 hover:bg-slate-100 text-xs text-slate-700 flex items-center gap-2" onClick={() => { alert("Draw Table"); closeMenu(); }}>
                    <PenLine size={14} className="text-slate-500"/> Draw Table
                 </button>
             </div>
         </MenuPortal>
    </>
  );
};
