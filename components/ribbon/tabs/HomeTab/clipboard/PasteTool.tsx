
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
        <div className="flex flex-col items-center w-[52px] md:w-[68px] h-full">
            <button 
                onClick={() => handlePasteSpecial('keep-source')}
                className="flex flex-col items-center justify-center flex-1 w-full rounded-t-lg hover:bg-slate-100 active:bg-blue-50 transition-colors pt-1.5 pb-0.5"
                title="Paste (Ctrl+V)"
            >
                <Clipboard className="w-6 h-6 text-blue-600 dark:text-blue-500" strokeWidth={1.5} />
            </button>
            <button 
                onClick={() => toggleMenu(menuId)}
                onMouseDown={(e) => e.preventDefault()}
                className={`flex items-center justify-center w-full h-6 rounded-b-lg hover:bg-slate-200 transition-colors ${activeMenu === menuId ? 'bg-slate-200' : ''}`}
            >
                <span className="text-xs font-medium text-slate-600 mr-0.5">Paste</span>
                <ChevronDown size={12} className="text-slate-500" />
            </button>
        </div>

        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={200}>
            <div className="p-1">
                <button onClick={() => { handlePasteSpecial('keep-source'); closeMenu(); }} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-2 group">
                    <Clipboard size={14} className="text-blue-500 group-hover:text-blue-600"/> Keep Source Formatting
                </button>
                <button onClick={() => { handlePasteSpecial('merge'); closeMenu(); }} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-2 group">
                    <ArrowDownAZ size={14} className="text-orange-500 group-hover:text-orange-600"/> Merge Formatting
                </button>
                <button onClick={() => { handlePasteSpecial('text-only'); closeMenu(); }} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-2 group">
                    <FileText size={14} className="text-slate-500 group-hover:text-slate-600"/> Keep Text Only
                </button>
            </div>
        </MenuPortal>
    </div>
  );
};
