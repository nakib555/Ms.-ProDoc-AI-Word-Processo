
import React, { useState, useEffect } from 'react';
import { Highlighter, Palette, ChevronDown, Check } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useHomeTab } from '../HomeTabContext';
import { MenuPortal } from '../../../common/MenuPortal';

const THEME_COLORS = [
  ['#ffffff', '#000000', '#e7e6e6', '#44546a', '#5b9bd5', '#ed7d31', '#a5a5a5', '#ffc000', '#4472c4', '#70ad47'],
  ['#f2f2f2', '#7f7f7f', '#d0cece', '#d6dce4', '#deebf6', '#fbe5d5', '#ededed', '#fff2cc', '#d9e2f3', '#e2efda'],
  ['#d8d8d8', '#595959', '#aeaaaa', '#acb9ca', '#bdd7ee', '#f8cbad', '#dbdbdb', '#ffe599', '#b4c6e7', '#c5e0b3'],
  ['#bfbfbf', '#3f3f3f', '#757070', '#8496b0', '#9cc2e5', '#f4b083', '#c9c9c9', '#ffd966', '#8eaadb', '#a8d08d'],
  ['#a5a5a5', '#262626', '#3a3838', '#32435f', '#2e75b5', '#c55a11', '#7b7b7b', '#bf8f00', '#2f5496', '#538135'],
  ['#7f7f7f', '#0c0c0c', '#171616', '#222a35', '#1f4e79', '#833c0b', '#525252', '#7f6000', '#1f3864', '#375623'],
];

const STANDARD_COLORS = ['#c00000', '#ff0000', '#ffc000', '#ffff00', '#92d050', '#00b050', '#00b0f0', '#0070c0', '#002060', '#7030a0'];

const HIGHLIGHT_COLORS = [
    '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#0000ff', '#ff0000', '#000080', '#008080', '#008000', '#800080', '#800000', '#808000', '#808080', '#c0c0c0', '#000000'
];

// Helper to convert RGB to Hex for grid matching
const rgbToHex = (color: string): string => {
  if (color.startsWith('#')) return color;
  
  const rgb = color.match(/\d+/g);
  if (!rgb) return color;
  
  const r = parseInt(rgb[0]);
  const g = parseInt(rgb[1]);
  const b = parseInt(rgb[2]);
  
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const ColorTools: React.FC = () => {
  const { executeCommand, editorRef } = useEditor();
  const { activeMenu, toggleMenu, closeMenu, menuPos, registerTrigger } = useHomeTab();
  
  const [fontColor, setFontColor] = useState('#000000'); 
  const [highlightColor, setHighlightColor] = useState('#ffff00'); // Default yellow for button
  const [detectedHighlight, setDetectedHighlight] = useState('transparent'); // Actual selection highlight

  // Auto-Detection of Colors from Selection
  useEffect(() => {
    const detectColors = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        let node = selection.anchorNode;
        // If node is text, get parent
        if (node && node.nodeType === Node.TEXT_NODE) {
            node = node.parentElement;
        }
        
        // Ensure selection is inside editor
        if (editorRef.current && node && editorRef.current.contains(node) && node instanceof HTMLElement) {
             const computed = window.getComputedStyle(node);
             
             // Detect Font Color
             const currentFg = computed.color;
             if (currentFg) {
                 setFontColor(rgbToHex(currentFg));
             }

             // Detect Background (Highlight) Color
             const currentBg = computed.backgroundColor;
             if (currentBg && currentBg !== 'rgba(0, 0, 0, 0)' && currentBg !== 'transparent') {
                 setDetectedHighlight(rgbToHex(currentBg));
             } else {
                 setDetectedHighlight('transparent');
             }
        }
    };

    document.addEventListener('selectionchange', detectColors);
    document.addEventListener('mouseup', detectColors);
    document.addEventListener('keyup', detectColors);
    
    return () => {
        document.removeEventListener('selectionchange', detectColors);
        document.removeEventListener('mouseup', detectColors);
        document.removeEventListener('keyup', detectColors);
    };
  }, [editorRef]);

  const handleFontColor = (color: string) => {
      setFontColor(color);
      executeCommand('foreColor', color);
      closeMenu();
  };

  const handleHighlight = (color: string) => {
      setHighlightColor(color); // Update the button's "last used" color
      setDetectedHighlight(color);
      executeCommand('hiliteColor', color);
      closeMenu();
  };

  const removeHighlight = () => {
      setDetectedHighlight('transparent');
      executeCommand('hiliteColor', 'transparent');
      closeMenu();
  };

  // Button click uses the "last chosen" highlight color (Word behavior), or yellow default
  const applyCurrentHighlight = () => {
      const colorToApply = highlightColor;
      setDetectedHighlight(colorToApply);
      executeCommand('hiliteColor', colorToApply);
  };

  return (
    <>
       {/* Highlight Color */}
       <div className="flex items-center gap-0.5 group relative">
          <div ref={(el) => registerTrigger('highlight_menu', el)} className="flex items-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 p-0.5">
            <button 
                className="p-1 rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex flex-col items-center justify-center h-6 w-7"
                onClick={applyCurrentHighlight}
                title="Text Highlight Color"
            >
                <Highlighter className="w-4 h-4 text-slate-700 dark:text-slate-300" strokeWidth={2} />
                <div className="h-1 w-full mt-0.5 border border-slate-200 dark:border-slate-600" style={{ backgroundColor: highlightColor }}></div>
            </button>
            <button 
                className="h-6 w-3 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 rounded-sm"
                onClick={(e) => { e.stopPropagation(); toggleMenu('highlight_menu'); }}
            >
                <ChevronDown size={10} className="text-slate-500 dark:text-slate-400"/>
            </button>
          </div>
       </div>

       <MenuPortal id="highlight_menu" activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={210}>
            <div className="p-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Highlight Colors</div>
                <div className="grid grid-cols-5 gap-1 mb-2">
                    {HIGHLIGHT_COLORS.map(c => (
                        <button 
                            key={c}
                            onClick={() => handleHighlight(c)}
                            className={`w-8 h-8 border hover:scale-110 transition-all flex items-center justify-center ${detectedHighlight.toLowerCase() === c.toLowerCase() ? 'border-slate-600 ring-1 ring-slate-400 shadow-sm z-10' : 'border-slate-200'}`}
                            style={{ backgroundColor: c }}
                            title={c}
                        >
                             {detectedHighlight.toLowerCase() === c.toLowerCase() && <Check size={12} className={c === '#000000' || c === '#000080' || c === '#800000' ? 'text-white' : 'text-black'} />}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={removeHighlight}
                    className="w-full text-left px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-sm text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 mt-1"
                >
                    <div className="w-4 h-4 border border-slate-300 bg-white flex items-center justify-center">
                        <div className="w-[1px] h-5 bg-red-500 rotate-45"></div>
                    </div>
                    No Color
                </button>
            </div>
       </MenuPortal>

       {/* Font Color */}
       <div className="flex items-center gap-0.5 group relative">
          <div ref={(el) => registerTrigger('font_color_menu', el)} className="flex items-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 p-0.5">
            <button 
                className="p-1 rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex flex-col items-center justify-center h-6 w-7"
                onClick={() => executeCommand('foreColor', fontColor)}
                title="Font Color"
            >
                <span className="font-serif font-bold text-lg leading-none -mt-1 text-slate-800 dark:text-slate-200">A</span>
                <div className="h-1 w-full mt-auto border border-slate-200 dark:border-slate-600" style={{ backgroundColor: fontColor }}></div>
            </button>
            <button 
                className="h-6 w-3 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 rounded-sm"
                onClick={(e) => { e.stopPropagation(); toggleMenu('font_color_menu'); }}
            >
                <ChevronDown size={10} className="text-slate-500 dark:text-slate-400"/>
            </button>
          </div>
       </div>

       <MenuPortal id="font_color_menu" activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={240}>
            <div className="p-2">
                <button 
                    className={`w-full text-left px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-sm text-xs text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2 ${fontColor === '#000000' ? 'bg-slate-100 dark:bg-slate-800 font-medium' : ''}`}
                    onClick={() => handleFontColor('#000000')}
                >
                    <div className="w-4 h-4 bg-black border border-slate-300"></div> Automatic
                </button>

                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Theme Colors</div>
                <div className="grid grid-cols-10 gap-[1px] mb-3">
                    {THEME_COLORS.map((row, i) => (
                        row.map((c, j) => (
                            <button 
                                key={`${i}-${j}`}
                                onClick={() => handleFontColor(c)}
                                className={`w-5 h-5 border hover:border-orange-400 hover:z-10 relative hover:shadow-sm flex items-center justify-center ${fontColor.toLowerCase() === c.toLowerCase() ? 'border-orange-500 z-10' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                                title={c}
                            >
                                {fontColor.toLowerCase() === c.toLowerCase() && <Check size={10} className="text-white drop-shadow-md" />}
                            </button>
                        ))
                    ))}
                </div>
                
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Standard Colors</div>
                <div className="grid grid-cols-10 gap-[1px] mb-2">
                    {STANDARD_COLORS.map(c => (
                        <button 
                            key={c}
                            onClick={() => handleFontColor(c)}
                            className={`w-5 h-5 border hover:border-orange-400 hover:z-10 relative hover:shadow-sm flex items-center justify-center ${fontColor.toLowerCase() === c.toLowerCase() ? 'border-orange-500 z-10' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                            title={c}
                        >
                            {fontColor.toLowerCase() === c.toLowerCase() && <Check size={10} className="text-white drop-shadow-md" />}
                        </button>
                    ))}
                </div>

                <button 
                    className="w-full text-left px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-sm text-xs text-slate-700 dark:text-slate-300 mt-1"
                    onClick={() => alert("More Colors Dialog")}
                >
                    More Colors...
                </button>
            </div>
       </MenuPortal>
    </>
  );
};
