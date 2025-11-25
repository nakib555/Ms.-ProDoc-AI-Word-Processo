
import React from 'react';
import { Link } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useInsertTab } from '../InsertTabContext';
import { DropdownButton } from '../common/InsertTools';
import { MenuPortal } from '../../../common/MenuPortal';

export const LinkTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useInsertTab();

  const insertLink = () => {
     const url = prompt("Enter URL:", "https://");
     if (url) executeCommand('createLink', url);
     closeMenu();
  };

  return (
    <>
         <DropdownButton 
             id="link_menu" 
             icon={Link} 
             label="Link" 
         />
         <MenuPortal id="link_menu" activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu}>
             <div className="p-1">
                 <button onClick={insertLink} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700">Insert Link...</button>
             </div>
         </MenuPortal>
    </>
  );
};
