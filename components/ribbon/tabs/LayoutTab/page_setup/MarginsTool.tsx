
import React from 'react';
import { LayoutTemplate } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useLayoutTab } from '../LayoutTabContext';
import { DropdownButton } from '../common/LayoutTools';
import { MenuPortal } from '../../../common/MenuPortal';

export const MarginsTool: React.FC = () => {
  const { setPageConfig } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useLayoutTab();
  const menuId = 'margins';

  const handleMarginChange = (margin: any) => {
      setPageConfig(prev => ({ ...prev, margins: margin }));
      closeMenu();
  };

  return (
    <>
         <DropdownButton 
             id={menuId} 
             icon={LayoutTemplate} 
             label="Margins" 
         />
         <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={240}>
             <div className="p-1 space-y-0.5">
                 <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Custom Setting</div>
                 <button className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md flex items-center gap-3 group" onClick={() => handleMarginChange('normal')}>
                     <div className="p-1 border border-slate-300 rounded bg-white group-hover:border-blue-400"><LayoutTemplate size={16} className="text-slate-400 group-hover:text-blue-500"/></div>
                     <div><div className="text-xs font-medium text-slate-700">Normal</div><div className="text-[10px] text-slate-500">Top 1" Bottom 1" Left 1" Right 1"</div></div>
                 </button>
                 <button className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md flex items-center gap-3 group" onClick={() => handleMarginChange('narrow')}>
                     <div className="p-1 border border-slate-300 rounded bg-white group-hover:border-blue-400"><LayoutTemplate size={16} className="text-slate-400 group-hover:text-blue-500"/></div>
                     <div><div className="text-xs font-medium text-slate-700">Narrow</div><div className="text-[10px] text-slate-500">Top 0.5" Bottom 0.5" Left 0.5" Right 0.5"</div></div>
                 </button>
                 <button className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md flex items-center gap-3 group" onClick={() => handleMarginChange('wide')}>
                     <div className="p-1 border border-slate-300 rounded bg-white group-hover:border-blue-400"><LayoutTemplate size={16} className="text-slate-400 group-hover:text-blue-500"/></div>
                     <div><div className="text-xs font-medium text-slate-700">Wide</div><div className="text-[10px] text-slate-500">Top 1" Bottom 1" Left 2" Right 2"</div></div>
                 </button>
             </div>
             <div className="border-t border-slate-100 mt-1 pt-1 p-1">
                 <button className="w-full text-left px-3 py-2 hover:bg-slate-100 text-xs font-medium text-slate-700 rounded-md">Custom Margins...</button>
             </div>
         </MenuPortal>
    </>
  );
};
