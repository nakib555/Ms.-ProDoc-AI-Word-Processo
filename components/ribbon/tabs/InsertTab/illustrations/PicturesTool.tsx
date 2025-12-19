
import React, { useRef } from 'react';
import { Image, Laptop, Globe } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useInsertTab } from '../InsertTabContext';
import { DropdownButton } from '../common/InsertTools';
import { MenuPortal } from '../../../common/MenuPortal';

export const PicturesTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useInsertTab();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertImage = (source: 'url' | 'file') => {
      if (source === 'url') {
          const url = prompt("Enter Image URL:", "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop");
          if(url) executeCommand('insertImage', url);
      } else {
          fileInputRef.current?.click();
      }
      closeMenu();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if(ev.target?.result) {
                  executeCommand('insertImage', ev.target.result as string);
              }
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <>
         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
         <DropdownButton 
             id="pictures_menu" 
             icon={Image} 
             label="Pictures" 
             iconClassName="text-green-600"
         />
         <MenuPortal id="pictures_menu" activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu}>
             <div className="p-1">
                 <button onClick={() => insertImage('file')} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center group">
                     <Laptop size={14} className="mr-2 text-slate-500 group-hover:text-blue-600"/> This Device...
                 </button>
                 <button onClick={() => insertImage('url')} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center group">
                     <Globe size={14} className="mr-2 text-emerald-500 group-hover:text-emerald-600"/> Online Pictures...
                 </button>
             </div>
         </MenuPortal>
    </>
  );
};
