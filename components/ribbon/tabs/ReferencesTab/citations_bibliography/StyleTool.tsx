
import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useReferencesTab } from '../ReferencesTabContext';
import { MenuPortal } from '../../../common/MenuPortal';

export const StyleTool: React.FC = () => {
  const { activeMenu, toggleMenu, closeMenu, menuPos, registerTrigger } = useReferencesTab();
  const [selectedStyle, setSelectedStyle] = useState('APA');
  const menuId = 'citation_style';
  const styles = ['APA', 'MLA', 'Chicago', 'IEEE'];

  return (
    <div className="flex items-center px-2 py-[1px] text-xs">
         <span className="text-slate-500 mr-2 w-8">Style:</span>
         <div ref={(el) => registerTrigger(menuId, el)} className="relative w-20">
             <button 
                onClick={(e) => { e.stopPropagation(); toggleMenu(menuId); }}
                onMouseDown={(e) => e.preventDefault()}
                className={`flex items-center justify-between w-full bg-transparent border rounded px-2 py-0.5 text-[10px] text-slate-700 outline-none transition-all ${activeMenu === menuId ? 'border-blue-500 ring-1 ring-blue-200 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-white'}`}
             >
                 <span className="truncate">{selectedStyle}</span>
                 <ChevronDown size={10} className="text-slate-400 shrink-0 ml-1" />
             </button>
         </div>
         
         <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={120}>
             <div className="p-1">
                 {styles.map(style => (
                     <button
                        key={style}
                        onClick={() => { setSelectedStyle(style); closeMenu(); }}
                        className={`flex items-center justify-between w-full text-left px-3 py-1.5 hover:bg-slate-100 rounded-md text-xs transition-colors ${selectedStyle === style ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}`}
                     >
                         {style}
                         {selectedStyle === style && <Check size={12} className="ml-2 shrink-0" />}
                     </button>
                 ))}
             </div>
         </MenuPortal>
    </div>
  );
};
