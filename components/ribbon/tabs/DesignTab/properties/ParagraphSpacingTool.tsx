
import React from 'react';
import { ArrowDown } from 'lucide-react';
import { useDesignTab } from '../DesignTabContext';
import { DropdownRibbonButton } from '../common/DesignTools';
import { MenuPortal } from '../../../common/MenuPortal';

export const ParagraphSpacingTool: React.FC = () => {
  const { activeMenu, menuPos, closeMenu } = useDesignTab();
  const menuId = 'para_spacing';

  return (
    <>
        <DropdownRibbonButton 
            id={menuId} 
            icon={ArrowDown} 
            label="Paragraph Spacing" 
        />
        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={180}>
             <div className="p-1">
                 <button className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700">Default</button>
                 <button className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700">No Paragraph Space</button>
                 <button className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700">Compact</button>
                 <button className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700">Tight</button>
                 <button className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700">Open</button>
                 <button className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700">Relaxed</button>
                 <button className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700">Double</button>
             </div>
        </MenuPortal>
    </>
  );
};
