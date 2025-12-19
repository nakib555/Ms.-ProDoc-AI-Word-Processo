
import React from 'react';
import { 
  CaseSensitive, Eraser, ChevronDown, Type, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { ToolBtn } from '../common/HomeTools';
import { useHomeTab } from '../HomeTabContext';
import { MenuPortal } from '../../../common/MenuPortal';

export const FontFormattingTools: React.FC = () => {
  const { executeCommand } = useEditor();
  const { activeMenu, toggleMenu, closeMenu, menuPos, registerTrigger } = useHomeTab();
  const menuId = 'change_case';

  const transformText = (type: 'sentence' | 'lower' | 'upper' | 'capitalize' | 'toggle') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    // Rough text extraction - in a real editor this needs robust DOM traversal to preserve tags
    const text = selection.toString();
    if (!text) return;

    let newText = text;

    switch(type) {
        case 'sentence':
            newText = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
            break;
        case 'lower':
            newText = text.toLowerCase();
            break;
        case 'upper':
            newText = text.toUpperCase();
            break;
        case 'capitalize':
            newText = text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
            break;
        case 'toggle':
            newText = text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
            break;
    }

    document.execCommand('insertText', false, newText);
    closeMenu();
  };

  return (
    <>
        <div className="w-[1px] h-4 bg-slate-200 mx-1" />
        
        <div className="relative">
            <button 
                ref={(el) => registerTrigger(menuId, el)}
                onClick={(e) => { e.stopPropagation(); toggleMenu(menuId); }}
                className={`p-1 rounded-md flex items-center justify-center transition-all h-7 relative group gap-0.5 ${activeMenu === menuId ? 'bg-slate-200 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'}`}
                title="Change Case"
            >
                <CaseSensitive className="w-4 h-4 text-slate-700 group-hover:text-blue-600" strokeWidth={2} />
                <ChevronDown size={8} className="text-slate-400" />
            </button>

            <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={180}>
                <div className="p-1 flex flex-col">
                    <button onClick={() => transformText('sentence')} className="text-left px-3 py-1.5 hover:bg-slate-100 rounded-sm text-xs text-slate-700 flex items-center gap-2 group">
                        <Type size={14} className="text-blue-500"/> Sentence case.
                    </button>
                    <button onClick={() => transformText('lower')} className="text-left px-3 py-1.5 hover:bg-slate-100 rounded-sm text-xs text-slate-700 flex items-center gap-2 group">
                         <ArrowDownCircle size={14} className="text-emerald-500"/> lowercase
                    </button>
                    <button onClick={() => transformText('upper')} className="text-left px-3 py-1.5 hover:bg-slate-100 rounded-sm text-xs text-slate-700 flex items-center gap-2 group">
                        <ArrowUpCircle size={14} className="text-orange-500"/> UPPERCASE
                    </button>
                    <button onClick={() => transformText('capitalize')} className="text-left px-3 py-1.5 hover:bg-slate-100 rounded-sm text-xs text-slate-700 flex items-center gap-2 group">
                        <Type size={14} className="text-purple-500"/> Capitalize Each Word
                    </button>
                    <button onClick={() => transformText('toggle')} className="text-left px-3 py-1.5 hover:bg-slate-100 rounded-sm text-xs text-slate-700 flex items-center gap-2 group">
                        <CaseSensitive size={14} className="text-rose-500"/> tOGGLE cASE
                    </button>
                </div>
            </MenuPortal>
        </div>

        <ToolBtn 
            icon={Eraser} 
            onClick={() => executeCommand('removeFormat')} 
            title="Clear All Formatting" 
            className="text-pink-600 hover:text-pink-700"
            iconClass="text-pink-600 dark:text-pink-400"
        />
    </>
  );
};
