
import React from 'react';
import { Sparkles, Zap, Smile, Bot, Coffee } from 'lucide-react';
import { DropdownRibbonButton } from '../common/AITools';
import { MenuPortal } from '../../../common/MenuPortal';
import { useAIAssistantTab } from '../AIAssistantTabContext';
import { useAI } from '../../../../../hooks/useAI';

export const ToneTool: React.FC = () => {
  const { activeMenu, menuPos, closeMenu } = useAIAssistantTab();
  const { performAIAction } = useAI();
  const menuId = 'tone_menu';

  return (
    <>
        <DropdownRibbonButton 
            id={menuId} 
            icon={Sparkles} 
            label="Change Tone" 
        />
        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={180}>
             <div className="p-1">
                 <button onClick={() => { performAIAction('make_professional'); closeMenu(); }} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-2">
                    <Zap size={14} className="text-blue-600"/> Professional
                 </button>
                 <button onClick={() => { performAIAction('tone_friendly'); closeMenu(); }} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-2">
                    <Smile size={14} className="text-green-600"/> Friendly
                 </button>
                 <button onClick={() => { performAIAction('tone_confident'); closeMenu(); }} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-2">
                    <Bot size={14} className="text-purple-600"/> Confident
                 </button>
                 <button onClick={() => { performAIAction('tone_casual'); closeMenu(); }} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-2">
                    <Coffee size={14} className="text-orange-600"/> Casual
                 </button>
             </div>
        </MenuPortal>
    </>
  );
};
