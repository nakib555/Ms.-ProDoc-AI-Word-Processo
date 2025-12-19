
import React from 'react';
import { Link, Globe } from 'lucide-react';
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
             iconClassName="text-blue-600 dark:text-blue-400"
         />
         <MenuPortal id="link_menu" activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu}>
             <div className="p-1">
                 <button onClick={insertLink} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-2 group">
                     <Globe size={14} className="text-slate-400 group-hover:text-blue-500"/>
                     Insert Link...
                 </button>
             </div>
         </MenuPortal>
    </>
  );
};
