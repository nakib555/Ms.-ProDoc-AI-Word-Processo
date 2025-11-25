
import React from 'react';
import { Columns, AlignStartVertical } from 'lucide-react';
import { useLayoutTab } from '../LayoutTabContext';
import { DropdownButton } from '../common/LayoutTools';
import { MenuPortal } from '../../../common/MenuPortal';

export const ColumnsTool: React.FC = () => {
  const { activeMenu, menuPos, closeMenu } = useLayoutTab();
  const menuId = 'columns';

  const handleColumnChange = (cols: number) => {
      alert(`Set columns to ${cols}. Note: Multi-column layout requires print view mode.`);
      closeMenu();
  };

  return (
    <>
         <DropdownButton 
             id={menuId} 
             icon={Columns} 
             label="Columns" 
         />
         <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={160}>
             <div className="p-1 grid grid-cols-1 gap-0.5">
                 <button onClick={() => handleColumnChange(1)} className="px-3 py-2 hover:bg-slate-100 text-left text-xs font-medium text-slate-700 flex items-center gap-2 rounded-md"><Columns size={14} className="opacity-50"/> One</button>
                 <button onClick={() => handleColumnChange(2)} className="px-3 py-2 hover:bg-slate-100 text-left text-xs font-medium text-slate-700 flex items-center gap-2 rounded-md"><Columns size={14}/> Two</button>
                 <button onClick={() => handleColumnChange(3)} className="px-3 py-2 hover:bg-slate-100 text-left text-xs font-medium text-slate-700 flex items-center gap-2 rounded-md"><Columns size={14}/> Three</button>
                 <div className="border-t border-slate-100 my-1"></div>
                 <button onClick={() => handleColumnChange(2)} className="px-3 py-2 hover:bg-slate-100 text-left text-xs font-medium text-slate-700 flex items-center gap-2 rounded-md"><AlignStartVertical size={14} className="rotate-180"/> Left</button>
                 <button onClick={() => handleColumnChange(2)} className="px-3 py-2 hover:bg-slate-100 text-left text-xs font-medium text-slate-700 flex items-center gap-2 rounded-md"><AlignStartVertical size={14}/> Right</button>
             </div>
         </MenuPortal>
    </>
  );
};
