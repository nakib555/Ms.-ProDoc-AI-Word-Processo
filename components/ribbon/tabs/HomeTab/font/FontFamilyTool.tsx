
import React, { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useHomeTab } from '../HomeTabContext';
import { MenuPortal } from '../../../common/MenuPortal';
import { FONTS } from '../../../../../constants';

export const FontFamilyTool: React.FC = () => {
  const { applyAdvancedStyle, editorRef } = useEditor();
  const { activeMenu, toggleMenu, closeMenu, menuPos, registerTrigger } = useHomeTab();
  const [currentFont, setCurrentFont] = useState('Arial');
  const menuId = 'font_family';

  // Track selection to update font indicator
  useEffect(() => {
    const handleSelectionChange = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        
        let node = selection.anchorNode;
        if (!node) return;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
        
        if (editorRef.current && editorRef.current.contains(node)) {
             const computed = window.getComputedStyle(node as HTMLElement);
             let font = computed.fontFamily.split(',')[0].trim().replace(/['"]/g, '');
             setCurrentFont(font);
        }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [editorRef]);

  return (
    <>
        <button
            ref={(el) => registerTrigger(menuId, el)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => { e.stopPropagation(); toggleMenu(menuId); }}
            className={`flex items-center justify-between text-[11px] border rounded-lg px-2 py-0.5 w-36 h-7 transition-colors outline-none group ${activeMenu === menuId ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'}`}
            title="Font Family"
        >
            <span className="truncate text-slate-700 font-medium">{currentFont}</span>
            <ChevronDown size={10} className="text-slate-400 group-hover:text-slate-600 shrink-0 ml-1" />
        </button>
        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={220}>
            <div className="max-h-[300px] overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 mb-1 rounded-md">Theme Fonts</div>
                {FONTS.map(font => (
                    <button
                        key={font}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { applyAdvancedStyle({ fontFamily: font }); closeMenu(); }}
                        className={`w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-sm transition-colors flex items-center group mb-0.5 ${currentFont === font ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}`}
                        style={{ fontFamily: font }}
                    >
                        {font}
                        {currentFont === font && <Check size={16} className="ml-auto text-blue-600"/>}
                    </button>
                ))}
            </div>
        </MenuPortal>
    </>
  );
};
