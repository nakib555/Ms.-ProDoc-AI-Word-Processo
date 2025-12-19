
import React from 'react';
import { PanelTop, File } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useInsertTab } from '../InsertTabContext';
import { DropdownButton } from '../common/InsertTools';
import { MenuPortal } from '../../../common/MenuPortal';

export const HeaderTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useInsertTab();

  return (
    <>
         <DropdownButton 
             id="header_menu" 
             icon={PanelTop} 
             label="Header" 
             iconClassName="text-yellow-600 dark:text-yellow-500"
         />
         <MenuPortal id="header_menu" activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu}>
              <div className="p-1">
                  <button className="w-full text-left px-3 py-2 hover:bg-slate-100 text-xs font-medium text-slate-700 rounded-md flex items-center gap-2 group" onClick={() => { executeCommand('insertHTML', '<header style="border-bottom:1px solid #ccc; padding-bottom:5px; margin-bottom:15px; color:#666;">Header</header>'); closeMenu(); }}>
                      <File size={14} className="text-slate-400 group-hover:text-blue-500"/> Default Header
                  </button>
                  <button className="w-full text-left px-3 py-2 hover:bg-slate-100 text-xs font-medium text-slate-700 rounded-md" onClick={() => closeMenu()}>Edit Header</button>
                  <button className="w-full text-left px-3 py-2 hover:bg-slate-100 text-xs font-medium text-red-600 rounded-md" onClick={() => closeMenu()}>Remove Header</button>
              </div>
         </MenuPortal>
    </>
  );
};
