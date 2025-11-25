
import React from 'react';
import { Languages, Globe } from 'lucide-react';
import { DropdownRibbonButton } from '../common/AITools';
import { MenuPortal } from '../../../common/MenuPortal';
import { useAIAssistantTab } from '../AIAssistantTabContext';
import { useAI } from '../../../../../hooks/useAI';

export const TranslateTool: React.FC = () => {
  const { activeMenu, menuPos, closeMenu } = useAIAssistantTab();
  const { performAIAction } = useAI();
  const menuId = 'translate_menu';

  return (
    <>
        <DropdownRibbonButton 
            id={menuId} 
            icon={Languages} 
            label="Translate" 
        />
        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={160}>
             <div className="p-1">
                 <button onClick={() => { performAIAction('translate_es'); closeMenu(); }} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-2">
                    <Globe size={14}/> Spanish
                 </button>
                 <button onClick={() => { performAIAction('translate_fr'); closeMenu(); }} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-2">
                    <Globe size={14}/> French
                 </button>
                 <button onClick={() => { performAIAction('translate_de'); closeMenu(); }} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-2">
                    <Globe size={14}/> German
                 </button>
             </div>
        </MenuPortal>
    </>
  );
};
