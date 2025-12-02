
import React, { useState, useEffect, useRef } from 'react';
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
             const sizePx = computed.fontSize; 
             if (sizePx) {
                const sizeVal = parseFloat(sizePx);
                // MS Word style uses integer values usually, but we can show decimals if present
                const valStr = Math.round(sizeVal).toString();
                
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

  const applySize = (size: string) => {
      const num = parseFloat(size);
      if (!isNaN(num) && num > 0) {
          applyAdvancedStyle({ fontSize: `${num}px` });
          setInputValue(num.toString());
          setCurrentFontSize(num.toString());
      }
      closeMenu();
      inputRef.current?.blur();
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
            className={`flex items-center border rounded-[2px] h-[22px] w-12 bg-white transition-colors group relative mr-1 ${activeMenu === menuId ? 'border-blue-400 ring-1 ring-blue-100' : 'border-slate-300 hover:border-blue-300'}`}
            title="Font Size (Ctrl+Shift+P)"
        >
            <input 
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => inputRef.current?.select()}
                onBlur={() => setInputValue(currentFontSize)}
                className="w-full h-full px-1 text-[11px] outline-none text-slate-800 font-medium bg-transparent text-center leading-tight"
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

        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={60}>
            <div className="max-h-[300px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200">
                {FONT_SIZES.map(size => (
                    <button
                        key={size}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applySize(size)}
                        className={`w-full text-center px-2 py-1 hover:bg-blue-50 hover:text-blue-700 text-xs transition-colors rounded-sm ${currentFontSize === size ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'}`}
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
