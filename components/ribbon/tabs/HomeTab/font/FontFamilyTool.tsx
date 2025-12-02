
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useHomeTab } from '../HomeTabContext';
import { MenuPortal } from '../../../common/MenuPortal';
import { FONTS } from '../../../../../constants';

export const FontFamilyTool: React.FC = () => {
  const { applyAdvancedStyle, editorRef } = useEditor();
  const { activeMenu, toggleMenu, closeMenu, menuPos, registerTrigger } = useHomeTab();
  const [currentFont, setCurrentFont] = useState('Arial');
  const [inputValue, setInputValue] = useState('Arial');
  const menuId = 'font_family';
  const inputRef = useRef<HTMLInputElement>(null);

  // Track selection to update font indicator
  useEffect(() => {
    const handleSelectionChange = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        
        let node = selection.anchorNode;
        // If node is text, get parent. If null (rare), ignore.
        if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
        
        // Ensure selection is inside editor
        if (editorRef.current && node && editorRef.current.contains(node)) {
             const computed = window.getComputedStyle(node as HTMLElement);
             // Clean up font string (remove quotes, handle stacks)
             let font = computed.fontFamily.split(',')[0].trim().replace(/['"]/g, '');
             
             // Only update if user is not actively typing in the box
             if (document.activeElement !== inputRef.current) {
                 setCurrentFont(font);
                 setInputValue(font);
             }
        }
    };

    // Listen to multiple events for responsiveness
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);
    
    return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
        document.removeEventListener('mouseup', handleSelectionChange);
        document.removeEventListener('keyup', handleSelectionChange);
    };
  }, [editorRef]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          applyAdvancedStyle({ fontFamily: inputValue });
          inputRef.current?.blur();
          closeMenu();
      }
  };

  const handleSelect = (font: string) => {
      applyAdvancedStyle({ fontFamily: font });
      setInputValue(font);
      setCurrentFont(font);
      closeMenu();
  };

  return (
    <>
        <div 
            ref={(el) => registerTrigger(menuId, el)}
            className={`flex items-center border rounded-[2px] h-[22px] w-32 bg-white transition-colors group relative mx-0.5 ${activeMenu === menuId ? 'border-blue-400 ring-1 ring-blue-100' : 'border-slate-300 hover:border-blue-300'}`}
            title="Font Family (Ctrl+Shift+F)"
        >
            <input 
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    // Optional: Select all on focus for quick replacement
                    inputRef.current?.select();
                }}
                onBlur={() => {
                    // Revert to actual font if typed value wasn't applied
                    setInputValue(currentFont);
                }}
                className="w-full h-full px-1.5 text-[11px] outline-none text-slate-800 font-medium bg-transparent leading-tight"
            />
            <button 
                onMouseDown={(e) => e.preventDefault()} 
                onClick={(e) => { e.stopPropagation(); toggleMenu(menuId); }}
                className="h-full px-0.5 hover:bg-blue-50 border-l border-transparent group-hover:border-slate-200 flex items-center justify-center"
                tabIndex={-1}
            >
                <ChevronDown size={10} className="text-slate-500" strokeWidth={2.5} />
            </button>
        </div>

        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={200}>
            <div className="max-h-[300px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 mb-1 rounded-sm">Theme Fonts</div>
                {FONTS.map(font => (
                    <button
                        key={font}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelect(font)}
                        className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-blue-700 text-xs transition-colors flex items-center group rounded-sm ${currentFont === font ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'}`}
                        style={{ fontFamily: font }}
                    >
                        {font}
                        {currentFont === font && <Check size={12} className="ml-auto text-blue-600"/>}
                    </button>
                ))}
            </div>
        </MenuPortal>
    </>
  );
};
