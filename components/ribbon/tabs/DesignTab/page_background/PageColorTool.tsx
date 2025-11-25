
import React from 'react';
import { PaintBucket } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useDesignTab } from '../DesignTabContext';
import { DropdownRibbonButton } from '../common/DesignTools';
import { MenuPortal } from '../../../common/MenuPortal';

export const PageColorTool: React.FC = () => {
  const { setPageConfig } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useDesignTab();
  const menuId = 'page_color';

  const setPageColor = (color: string | undefined) => {
      setPageConfig(prev => ({ ...prev, pageColor: color }));
      closeMenu();
  };

  return (
    <>
        <DropdownRibbonButton 
            id={menuId} 
            icon={PaintBucket} 
            label="Page Color" 
        />
        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={180}>
             <div className="p-2">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Standard Colors</div>
                 <div className="grid grid-cols-5 gap-1 mb-2">
                     {['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#fef2f2', '#fff7ed', '#f0fdf4', '#eff6ff', '#faf5ff'].map(color => (
                         <button 
                            key={color}
                            onClick={() => setPageColor(color)}
                            className="w-6 h-6 rounded-sm border border-slate-200 hover:scale-110 transition-transform shadow-sm"
                            style={{ backgroundColor: color }}
                            title={color}
                         />
                     ))}
                 </div>
                 <button onClick={() => setPageColor(undefined)} className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded text-xs text-slate-700 mt-1">No Color</button>
             </div>
        </MenuPortal>
    </>
  );
};
