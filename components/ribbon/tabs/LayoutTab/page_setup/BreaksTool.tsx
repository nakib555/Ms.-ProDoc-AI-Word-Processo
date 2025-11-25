
import React from 'react';
import { Scissors, PanelTop, Columns, WrapText, MoreHorizontal } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useLayoutTab } from '../LayoutTabContext';
import { DropdownButton } from '../common/LayoutTools';
import { MenuPortal } from '../../../common/MenuPortal';

export const BreaksTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useLayoutTab();
  const menuId = 'breaks';

  return (
    <>
         <DropdownButton 
             id={menuId} 
             icon={Scissors} 
             label="Breaks" 
         />
         <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={200}>
             <div className="p-2">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Page Breaks</div>
                 <button onClick={() => { executeCommand('insertHTML', '<div style="page-break-after: always;"></div><p><br/></p>'); closeMenu(); }} className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded text-xs text-slate-700 flex items-center gap-2 mb-1">
                     <PanelTop size={14} className="text-slate-400"/> Page
                 </button>
                 <button className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded text-xs text-slate-700 flex items-center gap-2 mb-1">
                     <Columns size={14} className="text-slate-400"/> Column
                 </button>
                 <button className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded text-xs text-slate-700 flex items-center gap-2">
                     <WrapText size={14} className="text-slate-400"/> Text Wrapping
                 </button>
                 
                 <div className="border-t border-slate-100 my-2"></div>
                 
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Section Breaks</div>
                 <button className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded text-xs text-slate-700 flex items-center gap-2 mb-1">
                     <PanelTop size={14} className="text-slate-400"/> Next Page
                 </button>
                 <button className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded text-xs text-slate-700 flex items-center gap-2">
                     <MoreHorizontal size={14} className="text-slate-400"/> Continuous
                 </button>
             </div>
         </MenuPortal>
    </>
  );
};
