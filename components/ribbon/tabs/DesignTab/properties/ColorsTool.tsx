
import React from 'react';
import { Palette } from 'lucide-react';
import { useDesignTab } from '../DesignTabContext';
import { DropdownRibbonButton } from '../common/DesignTools';
import { MenuPortal } from '../../../common/MenuPortal';

export const ColorsTool: React.FC = () => {
  const { activeMenu, menuPos, closeMenu } = useDesignTab();
  const menuId = 'theme_colors';

  return (
    <>
        <DropdownRibbonButton 
            id={menuId} 
            icon={Palette} 
            label="Colors" 
        />
        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={180}>
             <div className="p-1">
                 {['Office', 'Grayscale', 'Blue Warm', 'Blue Green', 'Violet II', 'Red Orange'].map((c, i) => (
                     <button key={i} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${i%2===0 ? 'from-blue-500 to-cyan-400' : 'from-orange-500 to-red-500'}`}></div> {c}
                     </button>
                 ))}
             </div>
        </MenuPortal>
    </>
  );
};
