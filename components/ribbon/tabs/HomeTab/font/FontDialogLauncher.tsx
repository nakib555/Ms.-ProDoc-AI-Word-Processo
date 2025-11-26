
import React, { useState, useRef, useEffect } from 'react';
import { Settings, Check, ChevronDown } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';

const RichSelect = ({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: {value: string, label: string}[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width
            });
        }
    }, [isOpen]);

    // Close on scroll to prevent floating issues
    useEffect(() => {
        if(isOpen) {
            const handleScroll = () => setIsOpen(false);
            window.addEventListener('scroll', handleScroll, true);
            return () => window.removeEventListener('scroll', handleScroll, true);
        }
    }, [isOpen]);

    return (
        <>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full border rounded-md px-3 py-2 text-sm flex items-center justify-between outline-none transition-all bg-white ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-300 hover:border-slate-400'}`}
            >
                <span className="truncate text-slate-700">{options.find(o => o.value === value)?.label}</span>
                <ChevronDown size={14} className="text-slate-400" />
            </button>
            
            {isOpen && (
                <div className="fixed inset-0 z-[70]" onClick={() => setIsOpen(false)}>
                    <div 
                        className="fixed bg-white border border-slate-200 rounded-md shadow-xl max-h-60 overflow-y-auto py-1 z-[71] animate-in fade-in zoom-in-95 duration-100 scrollbar-thin scrollbar-thumb-slate-200"
                        style={{ top: coords.top, left: coords.left, width: coords.width }}
                        onClick={e => e.stopPropagation()}
                    >
                        {options.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center justify-between transition-colors ${value === opt.value ? 'text-blue-600 font-medium bg-blue-50/50' : 'text-slate-700'}`}
                            >
                                {opt.label}
                                {value === opt.value && <Check size={14} className="shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

export const FontDialogLauncher: React.FC = () => {
  const { applyAdvancedStyle } = useEditor();
  const [showFontDialog, setShowFontDialog] = useState(false);
  const [fontSettings, setFontSettings] = useState({
    letterSpacing: '0px',
    textDecorationStyle: 'solid',
    doubleStrikethrough: false
  });

  const applyFontSettings = () => {
    const styles: any = {};
    if (fontSettings.letterSpacing !== '0px') styles.letterSpacing = fontSettings.letterSpacing;
    
    if (fontSettings.textDecorationStyle !== 'solid') {
        styles.textDecorationLine = 'underline';
        styles.textDecorationStyle = fontSettings.textDecorationStyle;
    }
    
    if (fontSettings.doubleStrikethrough) {
        styles.textDecorationLine = styles.textDecorationLine ? `${styles.textDecorationLine} line-through` : 'line-through';
        styles.textDecorationStyle = fontSettings.doubleStrikethrough ? 'double' : styles.textDecorationStyle;
    }

    applyAdvancedStyle(styles);
    setShowFontDialog(false);
  };

  return (
    <>
      <button 
        onClick={() => setShowFontDialog(true)}
        className="absolute -bottom-1 -right-1 p-0.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-sm"
        title="Advanced Font Settings"
      >
        <Settings size={10} />
      </button>

      {showFontDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white p-6 rounded-xl shadow-2xl w-96 animate-in zoom-in-95 border border-slate-200">
                <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-2">
                    <h3 className="text-lg font-bold text-slate-800">Advanced Font</h3>
                    <Settings size={16} className="text-slate-400"/>
                </div>
                
                <div className="space-y-5">
                    {/* Character Spacing */}
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Character Spacing</label>
                        <div className="flex items-center gap-3">
                            <input 
                                type="range" min="-2" max="10" step="0.5"
                                value={parseFloat(fontSettings.letterSpacing)} 
                                onChange={(e) => setFontSettings({...fontSettings, letterSpacing: `${e.target.value}px`})}
                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <span className="text-xs font-mono w-12 text-right bg-slate-100 py-1 px-2 rounded">{fontSettings.letterSpacing}</span>
                        </div>
                    </div>

                    {/* Underline Style */}
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Underline Style</label>
                        <RichSelect 
                            value={fontSettings.textDecorationStyle}
                            onChange={(val) => setFontSettings({...fontSettings, textDecorationStyle: val})}
                            options={[
                                { value: 'solid', label: 'Solid (Default)' },
                                { value: 'double', label: 'Double' },
                                { value: 'dotted', label: 'Dotted' },
                                { value: 'dashed', label: 'Dashed' },
                                { value: 'wavy', label: 'Wavy' }
                            ]}
                        />
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-2">
                         <button 
                            className="flex items-center gap-2 cursor-pointer group text-left w-full"
                            onClick={() => setFontSettings({...fontSettings, doubleStrikethrough: !fontSettings.doubleStrikethrough})}
                         >
                            <div 
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${fontSettings.doubleStrikethrough ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-slate-400'}`}
                                style={{ backgroundColor: fontSettings.doubleStrikethrough ? undefined : '#ffffff' }}
                            >
                                {fontSettings.doubleStrikethrough && <Check size={12} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className="text-sm text-slate-700 group-hover:text-slate-900 select-none">Double Strikethrough</span>
                         </button>
                    </div>
                    
                    {/* Preview */}
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-center h-20 flex items-center justify-center">
                        <span style={{
                            letterSpacing: fontSettings.letterSpacing,
                            textDecorationLine: fontSettings.textDecorationStyle !== 'solid' ? 'underline' : (fontSettings.doubleStrikethrough ? 'line-through' : undefined),
                            textDecorationStyle: (fontSettings.doubleStrikethrough ? 'double' : fontSettings.textDecorationStyle) as any
                        }} className="text-2xl text-slate-800">
                            AaBbYyQq
                        </span>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button onClick={() => setShowFontDialog(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md transition-colors">Cancel</button>
                        <button onClick={applyFontSettings} className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors shadow-sm">Apply</button>
                    </div>
                </div>
             </div>
        </div>
      )}
    </>
  );
};
