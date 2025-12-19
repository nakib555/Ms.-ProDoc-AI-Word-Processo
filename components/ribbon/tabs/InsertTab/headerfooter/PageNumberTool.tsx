
import React from 'react';
import { Hash, ArrowUp, ArrowDown } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useInsertTab } from '../InsertTabContext';
import { DropdownButton } from '../common/InsertTools';
import { MenuPortal } from '../../../common/MenuPortal';

export const PageNumberTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useInsertTab();

  return (
    <>
         <DropdownButton 
             id="pagenum_menu" 
             icon={Hash} 
             label="Page Number" 
             iconClassName="text-slate-600 dark:text-slate-400"
         />
         <MenuPortal id="pagenum_menu" activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu}>
              <div className="p-1">
                  <button className="w-full text-left px-3 py-2 hover:bg-slate-100 text-xs font-medium text-slate-700 rounded-md flex items-center gap-2 group" onClick={() => { executeCommand('insertText', ' [Page 1] '); closeMenu(); }}>
                      <ArrowUp size={14} className="text-slate-400 group-hover:text-blue-500"/> Top of Page
                  </button>
                  <button className="w-full text-left px-3 py-2 hover:bg-slate-100 text-xs font-medium text-slate-700 rounded-md flex items-center gap-2 group" onClick={() => { executeCommand('insertText', ' [Page 1] '); closeMenu(); }}>
                      <ArrowDown size={14} className="text-slate-400 group-hover:text-blue-500"/> Bottom of Page
                  </button>
              </div>
         </MenuPortal>
    </>
  );
};
