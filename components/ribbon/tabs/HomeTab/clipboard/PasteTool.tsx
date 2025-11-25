
import React from 'react';
import { Clipboard, ChevronDown, ArrowDownAZ, FileText } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useHomeTab } from '../HomeTabContext';
import { MenuPortal } from '../../../common/MenuPortal';

export const PasteTool: React.FC = () => {
  const { handlePasteSpecial } = useEditor();
  const { activeMenu, toggleMenu, closeMenu, menuPos, registerTrigger } = useHomeTab();
  const menuId = 'paste';

  return (
    <div ref={(el) => registerTrigger(menuId, el)} className="flex flex-col h-full items-center group relative">
        <div className="flex flex-col items-center w-[52px] md:w-[60px] h-full">
            <button 
                onClick={() => handlePasteSpecial('keep-source')}
                className="flex flex-col items-center justify-center flex-1 w-full rounded-t-lg hover:bg-slate-100 active:bg-blue-50 transition-colors pt-1"
                title="Paste (Ctrl+V)"
            >
                <Clipboard className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
            </button>
            <button 
                onClick={() => toggleMenu(menuId)}
                onMouseDown={(e) => e.preventDefault()}
                className={`w-full flex items-center justify-center h-6 hover:bg-slate-200 rounded-b-lg transition-colors text-[10px] font-medium text-slate-600 ${activeMenu === menuId ? 'bg-slate-200' : ''}`}
            >
                Paste <ChevronDown size={10} className="ml-1" />
            </button>
        </div>

        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={180}>
            <div className="p-1 space-y-0.5">
                <button onClick={() => {handlePasteSpecial('keep-source'); closeMenu()}} className="w-full flex items-center px-2 py-2 text-left text-xs hover:bg-slate-100 rounded-md">
                    <div className="p-1 bg-blue-100 rounded mr-2 text-blue-600"><Clipboard size={14}/></div>
                    <div>
                        <div className="font-medium text-slate-700">Keep Source</div>
                        <div className="text-[10px] text-slate-400">Preserves formatting</div>
                    </div>
                </button>
                <button onClick={() => {handlePasteSpecial('merge'); closeMenu()}} className="w-full flex items-center px-2 py-2 text-left text-xs hover:bg-slate-100 rounded-md">
                    <div className="p-1 bg-orange-100 rounded mr-2 text-orange-600"><ArrowDownAZ size={14}/></div>
                    <div>
                        <div className="font-medium text-slate-700">Merge Formatting</div>
                        <div className="text-[10px] text-slate-400">Matches current style</div>
                    </div>
                </button>
                <button onClick={() => {handlePasteSpecial('text-only'); closeMenu()}} className="w-full flex items-center px-2 py-2 text-left text-xs hover:bg-slate-100 rounded-md">
                    <div className="p-1 bg-slate-100 rounded mr-2 text-slate-600"><FileText size={14}/></div>
                    <div>
                        <div className="font-medium text-slate-700">Keep Text Only</div>
                        <div className="text-[10px] text-slate-400">Removes all formatting</div>
                    </div>
                </button>
            </div>
        </MenuPortal>
    </div>
  );
};
