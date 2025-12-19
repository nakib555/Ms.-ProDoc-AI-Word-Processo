
import React from 'react';
import { PanelBottom, File } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useInsertTab } from '../InsertTabContext';
import { DropdownButton } from '../common/InsertTools';
import { MenuPortal } from '../../../common/MenuPortal';

export const FooterTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useInsertTab();

  return (
    <>
         <DropdownButton 
             id="footer_menu" 
             icon={PanelBottom} 
             label="Footer" 
             iconClassName="text-yellow-600 dark:text-yellow-500"
         />
         <MenuPortal id="footer_menu" activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu}>
              <div className="p-1">
                  <button className="w-full text-left px-3 py-2 hover:bg-slate-100 text-xs font-medium text-slate-700 rounded-md flex items-center gap-2 group" onClick={() => { executeCommand('insertHTML', '<footer style="border-top:1px solid #ccc; padding-top:5px; margin-top:15px; color:#666; font-size:0.8em;">Footer</footer>'); closeMenu(); }}>
                      <File size={14} className="text-slate-400 group-hover:text-blue-500"/> Default Footer
                  </button>
                  <button className="w-full text-left px-3 py-2 hover:bg-slate-100 text-xs font-medium text-slate-700 rounded-md" onClick={() => closeMenu()}>Edit Footer</button>
              </div>
         </MenuPortal>
    </>
  );
};
