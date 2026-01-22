
import React, { useState, useEffect, useMemo } from 'react';
import { Settings, X, ChevronDown, Check, Type, MoreHorizontal } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { FONTS, FONT_SIZES } from '../../../../../constants';
import { ptToPx, pxToPt } from '../../../../../utils/textUtils';

// --- Custom UI Components ---

const TabButton = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2.5 text-sm font-medium transition-all relative ${
      active
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
    }`}
  >
    {label}
    {active && (
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full animate-in zoom-in-x duration-200" />
    )}
  </button>
);

const ModernCheckbox = ({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (c: boolean) => void; disabled?: boolean }) => (
  <label className={`flex items-center gap-3 cursor-pointer group p-1.5 -ml-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all shadow-sm ${checked ? 'bg-blue-600 border-blue-600 scale-100' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-blue-400 scale-95'}`}>
        <Check size={12} className={`text-white transition-transform ${checked ? 'scale-100' : 'scale-0'}`} strokeWidth={3} />
    </div>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="hidden"
    />
    <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors select-none">{label}</span>
  </label>
);

const ModernSelect = ({ label, value, onChange, options, className = '' }: any) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">{label}</label>}
    <div className="relative group">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
        >
          {options.map((o: any) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors"/>
    </div>
  </div>
);

// --- Main Dialog ---

export const FontDialogLauncher: React.FC = () => {
  const { applyAdvancedStyle, editorRef } = useEditor();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'font' | 'advanced'>('font');

  // State matching standard Word Font Dialog
  const [font, setFont] = useState('Calibri');
  const [fontStyle, setFontStyle] = useState('Regular');
  const [size, setSize] = useState('11'); // Points
  const [color, setColor] = useState('#000000');
  const [underline, setUnderline] = useState('none');
  const [underlineColor, setUnderlineColor] = useState('#000000');

  // Effects
  const [strikethrough, setStrikethrough] = useState(false);
  const [doubleStrikethrough, setDoubleStrikethrough] = useState(false);
  const [superscript, setSuperscript] = useState(false);
  const [subscript, setSubscript] = useState(false);
  const [smallCaps, setSmallCaps] = useState(false);
  const [allCaps, setAllCaps] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Advanced
  const [scale, setScale] = useState(100);
  const [spacing, setSpacing] = useState('normal'); // normal, expanded, condensed
  const [spacingBy, setSpacingBy] = useState(1);
  const [position, setPosition] = useState('normal'); // normal, raised, lowered
  const [positionBy, setPositionBy] = useState(3);
  const [kerning, setKerning] = useState(false);
  const [kerningMin, setKerningMin] = useState(10);
  const [ligatures, setLigatures] = useState('standard'); // none, standard, all

  // Auto-detect current style on open
  useEffect(() => {
    if (isOpen && editorRef.current) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            let node = sel.anchorNode;
            if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
            
            if (node && editorRef.current.contains(node)) {
                const computed = window.getComputedStyle(node as HTMLElement);
                const fFamily = computed.fontFamily.split(',')[0].replace(/['"]/g, '');
                setFont(fFamily || 'Calibri');
                
                const fontSizePx = parseFloat(computed.fontSize);
                if (!isNaN(fontSizePx)) {
                    setSize(Math.round(pxToPt(fontSizePx)).toString());
                } else {
                    setSize('11');
                }

                // Handle semantic colors (currentcolor)
                if (computed.color && computed.color !== 'currentcolor') {
                    // Simple RGB to Hex conversion or keep rgb string
                    // For input[type=color] we need hex
                    // Simplified: We assume defaults or rely on user to pick new
                    // setColor(...) - skipping complex rgb->hex for brevity in this UI demo
                }
                
                const isBold = parseInt(computed.fontWeight) >= 700 || computed.fontWeight === 'bold';
                const isItalic = computed.fontStyle === 'italic';
                
                if (isBold && isItalic) setFontStyle('Bold Italic');
                else if (isBold) setFontStyle('Bold');
                else if (isItalic) setFontStyle('Italic');
                else setFontStyle('Regular');

                setStrikethrough(computed.textDecorationLine.includes('line-through'));
            }
        }
    }
  }, [isOpen, editorRef]);

  const handleApply = () => {
    const sizePt = parseFloat(size);
    const sizePx = ptToPx(sizePt);

    const styles: React.CSSProperties = {
      fontFamily: font,
      fontSize: `${sizePx}px`,
      color: color,
      fontWeight: fontStyle.includes('Bold') ? 'bold' : 'normal',
      fontStyle: fontStyle.includes('Italic') ? 'italic' : 'normal',
      textDecorationLine: [
         (strikethrough || doubleStrikethrough) ? 'line-through' : '',
         underline !== 'none' ? 'underline' : ''
      ].filter(Boolean).join(' '),
      textDecorationStyle: doubleStrikethrough ? 'double' : (underline !== 'none' ? (underline as any) : undefined),
      textDecorationColor: underlineColor !== 'auto' ? underlineColor : undefined,
      fontVariant: smallCaps ? 'small-caps' : 'normal',
      textTransform: allCaps ? 'uppercase' : 'none',
      visibility: hidden ? 'hidden' : 'visible',
      letterSpacing: spacing === 'normal' ? '0px' : spacing === 'expanded' ? `${spacingBy}pt` : `-${spacingBy}pt`,
      verticalAlign: position === 'normal' ? 'baseline' : position === 'raised' ? 'super' : 'sub',
      fontFeatureSettings: ligatures === 'none' ? '"liga" 0' : '"liga" 1',
      transform: scale !== 100 ? `scaleX(${scale / 100})` : undefined,
    };
    
    if (kerning) {
       (styles as any).fontKerning = 'normal';
    }

    applyAdvancedStyle(styles);
    setIsOpen(false);
  };

  const previewStyle: React.CSSProperties = useMemo(() => ({
      fontFamily: font,
      fontSize: '24px', 
      color: color,
      fontWeight: fontStyle.includes('Bold') ? 'bold' : 'normal',
      fontStyle: fontStyle.includes('Italic') ? 'italic' : 'normal',
      textDecorationLine: [
         (strikethrough || doubleStrikethrough) ? 'line-through' : '',
         underline !== 'none' ? 'underline' : ''
      ].filter(Boolean).join(' '),
      textDecorationStyle: doubleStrikethrough ? 'double' : (underline !== 'none' ? (underline as any) : undefined),
      textDecorationColor: underlineColor !== 'auto' ? underlineColor : 'currentColor',
      fontVariant: smallCaps ? 'small-caps' : 'normal',
      textTransform: allCaps ? 'uppercase' : 'none',
      visibility: hidden ? 'hidden' : 'visible',
      letterSpacing: spacing === 'normal' ? '0px' : spacing === 'expanded' ? `${spacingBy}px` : `-${spacingBy}px`,
      transform: scale !== 100 ? `scaleX(${scale / 100})` : undefined,
      transformOrigin: 'center',
      display: 'inline-block',
      lineHeight: 1.5
  }), [font, fontStyle, size, color, underline, underlineColor, strikethrough, doubleStrikethrough, smallCaps, allCaps, hidden, spacing, spacingBy, scale]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-0 right-0 p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700/50 rounded-tl-lg transition-all"
        title="Advanced Font Settings (Ctrl+D)"
      >
        <Settings size={12} strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 font-sans select-none ring-1 ring-black/5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                        <Type size={16} />
                    </div>
                    <span className="font-bold text-sm tracking-tight">Font Settings</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                    <X size={18}/>
                </button>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-slate-100 dark:border-slate-800 flex gap-2 bg-slate-50/50 dark:bg-slate-900/50">
                <TabButton active={activeTab === 'font'} onClick={() => setActiveTab('font')} label="Font" />
                <TabButton active={activeTab === 'advanced'} onClick={() => setActiveTab('advanced')} label="Advanced" />
            </div>

            {/* Content Area */}
            <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                {activeTab === 'font' && (
                    <div className="space-y-6">
                        {/* Font Selection Grid */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <ModernSelect 
                                    label="Font" 
                                    value={font} 
                                    onChange={setFont} 
                                    options={FONTS.map(f => ({value: f, label: f}))} 
                                />
                            </div>
                            <div className="col-span-3">
                                <ModernSelect 
                                    label="Style" 
                                    value={fontStyle} 
                                    onChange={setFontStyle} 
                                    options={[
                                        {value: 'Regular', label: 'Regular'},
                                        {value: 'Italic', label: 'Italic'},
                                        {value: 'Bold', label: 'Bold'},
                                        {value: 'Bold Italic', label: 'Bold Italic'},
                                    ]} 
                                />
                            </div>
                            <div className="col-span-3">
                                <ModernSelect 
                                    label="Size" 
                                    value={size} 
                                    onChange={setSize} 
                                    options={FONT_SIZES.map(s => ({value: s, label: s}))} 
                                />
                            </div>
                        </div>

                        {/* Color & Decoration */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Color</label>
                                <div className="flex items-center gap-2 group">
                                    <div className="relative w-full">
                                        <div className="flex items-center w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 hover:border-blue-400 transition-colors shadow-sm cursor-pointer">
                                            <div className="w-6 h-6 rounded-md border border-slate-200 dark:border-slate-600 mr-3 shadow-inner" style={{backgroundColor: color}}></div>
                                            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Custom</span>
                                            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                                            <ChevronDown size={14} className="ml-auto text-slate-400"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                             <ModernSelect 
                                label="Underline Style" 
                                value={underline} 
                                onChange={setUnderline} 
                                options={[
                                    {value: 'none', label: '(None)'},
                                    {value: 'solid', label: 'Solid'},
                                    {value: 'double', label: 'Double'},
                                    {value: 'dotted', label: 'Dotted'},
                                    {value: 'dashed', label: 'Dashed'},
                                    {value: 'wavy', label: 'Wavy'},
                                ]} 
                            />
                        </div>

                        {/* Effects */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-2 block">Effects</label>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-x-6 gap-y-2">
                                <ModernCheckbox label="Strikethrough" checked={strikethrough} onChange={(v) => { setStrikethrough(v); if(v) setDoubleStrikethrough(false); }} />
                                <ModernCheckbox label="Double strikethrough" checked={doubleStrikethrough} onChange={(v) => { setDoubleStrikethrough(v); if(v) setStrikethrough(false); }} />
                                <ModernCheckbox label="Superscript" checked={superscript} onChange={(v) => { setSuperscript(v); if(v) setSubscript(false); }} />
                                <ModernCheckbox label="Subscript" checked={subscript} onChange={(v) => { setSubscript(v); if(v) setSuperscript(false); }} />
                                <ModernCheckbox label="Small caps" checked={smallCaps} onChange={(v) => { setSmallCaps(v); if(v) setAllCaps(false); }} />
                                <ModernCheckbox label="All caps" checked={allCaps} onChange={(v) => { setAllCaps(v); if(v) setSmallCaps(false); }} />
                                <ModernCheckbox label="Hidden" checked={hidden} onChange={setHidden} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'advanced' && (
                    <div className="space-y-6">
                         <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Scale</label>
                                    <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                                        <input 
                                            type="number" 
                                            value={scale} 
                                            onChange={(e) => setScale(Number(e.target.value))} 
                                            className="w-full px-3 py-2.5 text-sm outline-none bg-transparent"
                                        />
                                        <span className="px-3 text-slate-400 text-sm font-medium border-l border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">%</span>
                                    </div>
                                </div>
                                <ModernSelect 
                                    label="Spacing" 
                                    value={spacing} 
                                    onChange={setSpacing} 
                                    options={[
                                        {value: 'normal', label: 'Normal'},
                                        {value: 'expanded', label: 'Expanded'},
                                        {value: 'condensed', label: 'Condensed'},
                                    ]} 
                                />
                            </div>

                             {spacing !== 'normal' && (
                                <div className="flex items-center gap-3 animate-in slide-in-from-top-2 fade-in">
                                    <span className="text-sm text-slate-600 font-medium">By:</span>
                                    <input type="number" value={spacingBy} onChange={(e) => setSpacingBy(Number(e.target.value))} className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-sm" />
                                    <span className="text-sm text-slate-500">pt</span>
                                </div>
                            )}

                             <div className="grid grid-cols-2 gap-4">
                                <ModernSelect 
                                    label="Position" 
                                    value={position} 
                                    onChange={setPosition} 
                                    options={[
                                        {value: 'normal', label: 'Normal'},
                                        {value: 'raised', label: 'Raised'},
                                        {value: 'lowered', label: 'Lowered'},
                                    ]} 
                                />
                                <ModernSelect 
                                    label="Ligatures" 
                                    value={ligatures} 
                                    onChange={setLigatures} 
                                    options={[
                                        {value: 'none', label: 'None'},
                                        {value: 'standard', label: 'Standard Only'},
                                        {value: 'all', label: 'All'},
                                    ]} 
                                />
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <ModernCheckbox label="Kerning for fonts" checked={kerning} onChange={setKerning} />
                                    <div className={`flex items-center gap-2 transition-opacity ${kerning ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                        <input type="number" value={kerningMin} onChange={(e) => setKerningMin(Number(e.target.value))} className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-sm text-center" />
                                        <span className="text-sm text-slate-500">points and above</span>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>
                )}

                {/* Preview Box */}
                <div className="mt-6">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">Preview</div>
                    <div className="h-24 flex items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
                         <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
                         <span style={previewStyle} className="transition-all duration-300">
                             AaBbCcDdEeFfGg
                         </span>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <button 
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 shadow-sm transition-all"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleApply}
                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200/50 dark:shadow-none transition-all active:scale-95"
                >
                    OK
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
