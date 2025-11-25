
import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useHomeTab } from '../HomeTabContext';
import { MenuPortal } from '../../../common/MenuPortal';
import { FONT_SIZES } from '../../../../../constants';
import { ToolBtn } from '../common/HomeTools';

export const FontSizeTool: React.FC = () => {
  const { applyAdvancedStyle, executeCommand, editorRef } = useEditor();
  const { activeMenu, toggleMenu, closeMenu, menuPos, registerTrigger } = useHomeTab();
  const [currentFontSize, setCurrentFontSize] = useState('11');
  const menuId = 'font_size';

  // Track selection
  useEffect(() => {
    const handleSelectionChange = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        
        let node = selection.anchorNode;
        if (!node) return;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
        
        if (editorRef.current && editorRef.current.contains(node)) {
             const computed = window.getComputedStyle(node as HTMLElement);
             const sizePx = computed.fontSize; 
             if (sizePx) {
                const sizeVal = parseFloat(sizePx);
                setCurrentFontSize(Math.round(sizeVal).toString());
             }
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
            className={`flex items-center justify-between text-[11px] border rounded-lg px-2 py-0.5 w-16 h-7 transition-colors outline-none group ${activeMenu === menuId ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'}`}
            title="Font Size"
        >
            <span className="truncate text-slate-700 font-medium">{currentFontSize}</span>
            <ChevronDown size={10} className="text-slate-400 group-hover:text-slate-600 shrink-0 ml-1" />
        </button>
        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={90}>
            <div className="max-h-[300px] overflow-y-auto p-1.5 grid grid-cols-1 gap-0.5 scrollbar-thin scrollbar-thumb-slate-200">
                {FONT_SIZES.map(size => (
                    <button
                        key={size}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { applyAdvancedStyle({ fontSize: `${size}px` }); closeMenu(); }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-xs transition-colors text-center ${currentFontSize === size ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'}`}
                    >
                        {size}
                    </button>
                ))}
            </div>
        </MenuPortal>

        <div className="w-[1px] h-4 bg-slate-200 mx-1" />
            
        <ToolBtn icon={Plus} onClick={() => executeCommand('growFont')} title="Increase Font Size (Ctrl+>)" />
        <ToolBtn icon={Minus} onClick={() => executeCommand('shrinkFont')} title="Decrease Font Size (Ctrl+<)" />
    </>
  );
};
