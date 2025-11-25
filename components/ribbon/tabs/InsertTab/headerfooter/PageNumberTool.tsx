
import React from 'react';
import { Hash } from 'lucide-react';
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
         />
         <MenuPortal id="pagenum_menu" activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu}>
              <div className="p-1">
                  <button className="w-full text-left px-3 py-2 hover:bg-slate-100 text-xs font-medium text-slate-700 rounded-md" onClick={() => { executeCommand('insertText', ' [Page 1] '); closeMenu(); }}>Top of Page</button>
                  <button className="w-full text-left px-3 py-2 hover:bg-slate-100 text-xs font-medium text-slate-700 rounded-md" onClick={() => { executeCommand('insertText', ' [Page 1] '); closeMenu(); }}>Bottom of Page</button>
              </div>
         </MenuPortal>
    </>
  );
};
