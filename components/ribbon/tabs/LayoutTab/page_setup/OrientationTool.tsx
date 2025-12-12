
import React from 'react';
import { RotateCw, FileText } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useLayoutTab } from '../LayoutTabContext';
import { DropdownButton } from '../common/LayoutTools';
import { MenuPortal } from '../../../common/MenuPortal';

export const OrientationTool: React.FC = () => {
  const { pageConfig, setPageConfig } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useLayoutTab();
  const menuId = 'orientation';

  const handleOrientationChange = (orientation: any) => {
      setPageConfig(prev => ({ ...prev, orientation }));
      closeMenu();
  };

  return (
    <>
         <DropdownButton 
             id={menuId} 
             icon={RotateCw} 
             label="Orientation" 
             iconClassName="text-cyan-600"
         />
         <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={160}>
             <div className="p-1">
                 <button onClick={() => handleOrientationChange('portrait')} className={`w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md flex items-center gap-2 text-xs font-medium ${pageConfig.orientation === 'portrait' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}`}>
                     <FileText size={14} /> Portrait
                 </button>
                 <button onClick={() => handleOrientationChange('landscape')} className={`w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md flex items-center gap-2 text-xs font-medium ${pageConfig.orientation === 'landscape' ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}`}>
                     <FileText size={14} className="rotate-90" /> Landscape
                 </button>
             </div>
         </MenuPortal>
    </>
  );
};
