
import React from 'react';
import { FileText } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useLayoutTab } from '../LayoutTabContext';
import { DropdownButton } from '../common/LayoutTools';
import { MenuPortal } from '../../../common/MenuPortal';

export const SizeTool: React.FC = () => {
  const { pageConfig, setPageConfig } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useLayoutTab();
  const menuId = 'size';

  const handleSizeChange = (size: any) => {
      setPageConfig(prev => ({ ...prev, size }));
      closeMenu();
  };

  return (
    <>
         <DropdownButton 
             id={menuId} 
             icon={FileText} 
             label="Size" 
         />
         <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={180}>
             <div className="p-1 space-y-0.5">
                 {['Letter', 'Legal', 'A4', 'A5', 'Executive'].map(size => (
                     <button key={size} onClick={() => handleSizeChange(size)} className={`w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md flex items-center justify-between text-xs font-medium ${pageConfig.size === size ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}`}>
                         {size}
                         <span className="text-[9px] text-slate-400 ml-2">{size === 'A4' ? '8.27" x 11.69"' : '8.5" x 11"'}</span>
                     </button>
                 ))}
                 <div className="border-t border-slate-100 my-1"></div>
                 <button className="w-full text-left px-3 py-2 hover:bg-slate-100 text-xs text-slate-700 rounded-md">More Paper Sizes...</button>
             </div>
         </MenuPortal>
    </>
  );
};
