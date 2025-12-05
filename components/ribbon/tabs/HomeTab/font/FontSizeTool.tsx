
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, AArrowUp, AArrowDown } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useHomeTab } from '../HomeTabContext';
import { MenuPortal } from '../../../common/MenuPortal';
import { ToolBtn } from '../common/HomeTools';
import { ptToPx, pxToPt } from '../../../../../utils/textUtils';

// Standard Word Font Sizes (Points)
const STD_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

export const FontSizeTool: React.FC = () => {
  const { applyAdvancedStyle, editorRef } = useEditor();
  const { activeMenu, toggleMenu, closeMenu, menuPos, registerTrigger } = useHomeTab();
  const [currentFontSize, setCurrentFontSize] = useState('11');
  const [inputValue, setInputValue] = useState('11');
  const menuId = 'font_size';
  const inputRef = useRef<HTMLInputElement>(null);

  // Track selection
  useEffect(() => {
    const handleSelectionChange = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        
        let node = selection.anchorNode;
        if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
        
        if (editorRef.current && node && editorRef.current.contains(node)) {
             const computed = window.getComputedStyle(node as HTMLElement);
             const sizePx = computed.fontSize; // Browser returns px (e.g., "16px")
             if (sizePx) {
                const sizeValPx = parseFloat(sizePx);
                // Convert PX to PT for UI display
                const sizeValPt = pxToPt(sizeValPx);
                const valStr = Math.round(sizeValPt).toString();
                
                if (document.activeElement !== inputRef.current) {
                     setCurrentFontSize(valStr);
                     setInputValue(valStr);
                }
             }
        }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);
    
    return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
        document.removeEventListener('mouseup', handleSelectionChange);
        document.removeEventListener('keyup', handleSelectionChange);
    };
  }, [editorRef]);

  const applySize = (size: number | string) => {
      const pt = parseFloat(size.toString());
      if (!isNaN(pt) && pt > 0) {
          // Apply as pixels for consistency in web view (12pt -> 16px)
          const px = ptToPx(pt);
          applyAdvancedStyle({ fontSize: `${px}px` });
          
          setInputValue(pt.toString());
          setCurrentFontSize(pt.toString());
      }
      closeMenu();
      inputRef.current?.blur();
  };

  const handleGrow = () => {
      const current = parseFloat(currentFontSize) || 11;
      // Find next size in list
      const next = STD_SIZES.find(s => s > current) || (current + 1);
      applySize(next);
  };

  const handleShrink = () => {
      const current = parseFloat(currentFontSize) || 11;
      // Find prev size
      const prev = [...STD_SIZES].reverse().find(s => s < current) || Math.max(1, current - 1);
      applySize(prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          applySize(inputValue);
      }
  };

  return (
    <>
        <div 
            ref={(el) => registerTrigger(menuId, el)}
            className={`flex items-center border rounded-md h-[26px] w-16 bg-white dark:bg-slate-800 transition-colors group relative mr-1 ${activeMenu === menuId ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600'}`}
            title="Font Size (Points)"
        >
            <input 
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => inputRef.current?.select()}
                onBlur={() => setInputValue(currentFontSize)}
                className="w-full h-full px-2 text-xs outline-none text-slate-700 dark:text-slate-200 font-medium bg-transparent text-center leading-tight rounded-l-md"
            />
            <button 
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => { e.stopPropagation(); toggleMenu(menuId); }}
                className="h-full px-1 hover:bg-slate-100 dark:hover:bg-slate-700 border-l border-transparent group-hover:border-slate-100 dark:group-hover:border-slate-700 flex items-center justify-center rounded-r-md transition-colors"
                tabIndex={-1}
            >
                <ChevronDown size={12} className="text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-400" strokeWidth={2} />
            </button>
        </div>

        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={70}>
            <div className="max-h-[300px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200">
                {STD_SIZES.map(size => (
                    <button
                        key={size}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applySize(size)}
                        className={`w-full text-center px-2 py-1.5 hover:bg-blue-50 hover:text-blue-700 text-xs transition-colors rounded-md ${parseInt(currentFontSize) === size ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'}`}
                    >
                        {size}
                    </button>
                ))}
            </div>
        </MenuPortal>

        <div className="w-[1px] h-4 bg-slate-200 mx-1" />
            
        <ToolBtn 
            icon={AArrowUp} 
            onClick={handleGrow} 
            title="Increase Font Size (Ctrl+>)" 
            className="text-slate-700" 
        />

        <ToolBtn 
            icon={AArrowDown} 
            onClick={handleShrink} 
            title="Decrease Font Size (Ctrl+<)" 
            className="text-slate-700" 
        />
    </>
  );
};
