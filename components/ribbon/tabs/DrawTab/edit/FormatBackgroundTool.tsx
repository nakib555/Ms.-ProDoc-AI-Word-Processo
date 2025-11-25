import React from 'react';
import { Grid, FileText } from 'lucide-react';
import { DropdownRibbonButton } from '../common/DrawTools';
import { MenuPortal } from '../../../common/MenuPortal';
import { useDrawTab } from '../DrawTabContext';
import { useEditor } from '../../../../../contexts/EditorContext';

export const FormatBackgroundTool: React.FC = () => {
  const { activeMenu, menuPos, closeMenu } = useDrawTab();
  const { pageConfig, setPageConfig } = useEditor();
  const menuId = 'bg_format';

  const setBackground = (type: 'none' | 'ruled' | 'grid') => {
      setPageConfig(prev => ({ ...prev, background: type }));
      closeMenu();
  };

  return (
    <>
        <DropdownRibbonButton 
            id={menuId}
            icon={Grid} 
            label="Format Background" 
        />
        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={180}>
             <div className="p-1">
                 <button onClick={() => setBackground('none')} className={`w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-2 ${pageConfig.background === 'none' ? 'bg-blue-50 text-blue-700' : ''}`}>
                     <FileText size={14}/> None
                 </button>
                 <button onClick={() => setBackground('ruled')} className={`w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-2 ${pageConfig.background === 'ruled' ? 'bg-blue-50 text-blue-700' : ''}`}>
                     <Grid size={14} className="scale-y-50"/> Ruled Lines
                 </button>
                 <button onClick={() => setBackground('grid')} className={`w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-2 ${pageConfig.background === 'grid' ? 'bg-blue-50 text-blue-700' : ''}`}>
                     <Grid size={14}/> Grid Lines
                 </button>
             </div>
        </MenuPortal>
    </>
  );
};