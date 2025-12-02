
import React, { useState, useEffect, useMemo } from 'react';
import { Settings, X, ChevronDown } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { FONTS, FONT_SIZES } from '../../../../../constants';
import { ptToPx, pxToPt } from '../../../../../utils/textUtils';

const TabButton = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 text-xs font-medium border-t border-x rounded-t-md -mb-[1px] transition-colors ${
      active
        ? 'bg-white border-slate-300 text-blue-600 border-b-transparent z-10'
        : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'
    }`}
  >
    {label}
  </button>
);

const Checkbox = ({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (c: boolean) => void; disabled?: boolean }) => (
  <label className={`flex items-center gap-2 cursor-pointer group ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-3.5 h-3.5 border-slate-300 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
    />
    <span className="text-xs text-slate-700 group-hover:text-slate-900 select-none">{label}</span>
  </label>
);

const Select = ({ label, value, onChange, options, className = '' }: any) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    {label && <label className="text-[10px] text-slate-500 font-medium">{label}</label>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-slate-300 rounded-sm px-2 py-1 text-xs bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
    >
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

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
                // Attempt to populate
                const fFamily = computed.fontFamily.split(',')[0].replace(/['"]/g, '');
                setFont(fFamily || 'Calibri');
                
                // Convert PX from browser to PT for UI
                const fontSizePx = parseFloat(computed.fontSize);
                if (!isNaN(fontSizePx)) {
                    setSize(Math.round(pxToPt(fontSizePx)).toString());
                } else {
                    setSize('11');
                }

                setColor(computed.color || '#000000');
                
                const isBold = parseInt(computed.fontWeight) >= 700 || computed.fontWeight === 'bold';
                const isItalic = computed.fontStyle === 'italic';
                
                if (isBold && isItalic) setFontStyle('Bold Italic');
                else if (isBold) setFontStyle('Bold');
                else if (isItalic) setFontStyle('Italic');
                else setFontStyle('Regular');

                setStrikethrough(computed.textDecorationLine.includes('line-through'));
                // Cannot easily detect double strikethrough or small caps from computed style if they aren't standard CSS keywords
            }
        }
    }
  }, [isOpen, editorRef]);

  const handleApply = () => {
    // Convert size (Points) to Pixels for CSS application
    const sizePt = parseFloat(size);
    const sizePx = ptToPx(sizePt);

    const styles: React.CSSProperties = {
      fontFamily: font,
      fontSize: `${sizePx}px`, // Explicitly use pixels
      color: color,
      fontWeight: fontStyle.includes('Bold') ? 'bold' : 'normal',
      fontStyle: fontStyle.includes('Italic') ? 'italic' : 'normal',
      // Combine text decorations
      textDecorationLine: [
         (strikethrough || doubleStrikethrough) ? 'line-through' : '',
         underline !== 'none' ? 'underline' : ''
      ].filter(Boolean).join(' '),
      textDecorationStyle: doubleStrikethrough ? 'double' : (underline !== 'none' ? (underline as any) : undefined),
      textDecorationColor: underlineColor !== 'auto' ? underlineColor : undefined,
      
      // Effects
      fontVariant: smallCaps ? 'small-caps' : 'normal',
      textTransform: allCaps ? 'uppercase' : 'none',
      visibility: hidden ? 'hidden' : 'visible',
      
      // Advanced
      letterSpacing: spacing === 'normal' ? '0px' : spacing === 'expanded' ? `${spacingBy}pt` : `-${spacingBy}pt`,
      verticalAlign: position === 'normal' ? 'baseline' : position === 'raised' ? 'super' : 'sub',
      fontFeatureSettings: ligatures === 'none' ? '"liga" 0' : '"liga" 1',
      
      // Scale transform (hacky for CSS but works for visual)
      transform: scale !== 100 ? `scaleX(${scale / 100})` : undefined,
    };
    
    if (kerning) {
       // CSS uses font-kerning
       (styles as any).fontKerning = 'normal';
    }

    applyAdvancedStyle(styles);
    setIsOpen(false);
  };

  const previewStyle: React.CSSProperties = useMemo(() => ({
      fontFamily: font,
      fontSize: '14pt', // Fixed size for preview readability
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
      display: 'inline-block'
  }), [font, fontStyle, size, color, underline, underlineColor, strikethrough, doubleStrikethrough, smallCaps, allCaps, hidden, spacing, spacingBy, scale]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="absolute -bottom-1 -right-1 p-0.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-sm transition-colors"
        title="Font Settings (Ctrl+D)"
      >
        <Settings size={10} />
      </button>

      {isOpen && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[1px]"
            onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl border border-slate-300 w-[450px] overflow-hidden animate-in zoom-in-95 duration-100 font-sans select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title Bar */}
            <div className="flex justify-between items-center px-3 py-2 bg-white border-b border-slate-200">
                <span className="text-xs font-medium text-slate-800">Font</span>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500"><X size={14}/></button>
            </div>

            {/* Tabs */}
            <div className="px-4 pt-3 bg-slate-50 border-b border-slate-300 flex gap-1">
                <TabButton active={activeTab === 'font'} onClick={() => setActiveTab('font')} label="Font" />
                <TabButton active={activeTab === 'advanced'} onClick={() => setActiveTab('advanced')} label="Advanced" />
            </div>

            {/* Content Area */}
            <div className="p-4 h-[380px] overflow-y-auto bg-white">
                {activeTab === 'font' && (
                    <div className="space-y-4">
                        {/* Font Selection Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            <Select 
                                label="Font" 
                                value={font} 
                                onChange={setFont} 
                                options={FONTS.map(f => ({value: f, label: f}))} 
                            />
                            <Select 
                                label="Font style" 
                                value={fontStyle} 
                                onChange={setFontStyle} 
                                options={[
                                    {value: 'Regular', label: 'Regular'},
                                    {value: 'Italic', label: 'Italic'},
                                    {value: 'Bold', label: 'Bold'},
                                    {value: 'Bold Italic', label: 'Bold Italic'},
                                ]} 
                            />
                            <Select 
                                label="Size (pt)" 
                                value={size} 
                                onChange={setSize} 
                                options={FONT_SIZES.map(s => ({value: s, label: s}))} 
                            />
                        </div>

                        {/* Color & Underline */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-slate-500 font-medium mb-1 block">Font color</label>
                                <div className="flex items-center border border-slate-300 rounded-sm px-2 py-1 cursor-pointer hover:border-blue-400 bg-white">
                                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-4 opacity-0 absolute cursor-pointer" />
                                    <div className="w-full h-4 rounded-sm border border-slate-200" style={{backgroundColor: color}}></div>
                                    <ChevronDown size={12} className="ml-2 text-slate-400"/>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 font-medium mb-1 block">Underline style</label>
                                <select value={underline} onChange={(e) => setUnderline(e.target.value)} className="w-full border border-slate-300 rounded-sm px-2 py-1 text-xs outline-none bg-white">
                                    <option value="none">(none)</option>
                                    <option value="solid">Solid</option>
                                    <option value="double">Double</option>
                                    <option value="dotted">Dotted</option>
                                    <option value="dashed">Dashed</option>
                                    <option value="wavy">Wavy</option>
                                </select>
                            </div>
                        </div>

                        {/* Effects Checkboxes */}
                        <fieldset className="border border-slate-200 rounded px-3 py-2">
                            <legend className="text-[10px] text-slate-500 px-1">Effects</legend>
                            <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                                <Checkbox label="Strikethrough" checked={strikethrough} onChange={(v) => { setStrikethrough(v); if(v) setDoubleStrikethrough(false); }} />
                                <Checkbox label="Double strikethrough" checked={doubleStrikethrough} onChange={(v) => { setDoubleStrikethrough(v); if(v) setStrikethrough(false); }} />
                                <Checkbox label="Superscript" checked={superscript} onChange={(v) => { setSuperscript(v); if(v) setSubscript(false); }} />
                                <Checkbox label="Subscript" checked={subscript} onChange={(v) => { setSubscript(v); if(v) setSuperscript(false); }} />
                                <Checkbox label="Small caps" checked={smallCaps} onChange={(v) => { setSmallCaps(v); if(v) setAllCaps(false); }} />
                                <Checkbox label="All caps" checked={allCaps} onChange={(v) => { setAllCaps(v); if(v) setSmallCaps(false); }} />
                                <Checkbox label="Hidden" checked={hidden} onChange={setHidden} />
                            </div>
                        </fieldset>
                    </div>
                )}

                {activeTab === 'advanced' && (
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3 items-center">
                                <label className="text-xs text-slate-700">Scale:</label>
                                <div className="col-span-2 flex items-center gap-2">
                                    <input type="number" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-20 border border-slate-300 rounded px-2 py-1 text-xs" />
                                    <span className="text-xs text-slate-500">%</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3 items-center">
                                <label className="text-xs text-slate-700">Spacing:</label>
                                <div className="col-span-2 flex items-center gap-2">
                                    <select value={spacing} onChange={(e) => setSpacing(e.target.value)} className="w-24 border border-slate-300 rounded px-2 py-1 text-xs">
                                        <option value="normal">Normal</option>
                                        <option value="expanded">Expanded</option>
                                        <option value="condensed">Condensed</option>
                                    </select>
                                    {spacing !== 'normal' && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-slate-500">By:</span>
                                            <input type="number" value={spacingBy} onChange={(e) => setSpacingBy(Number(e.target.value))} className="w-14 border border-slate-300 rounded px-1 py-0.5 text-xs" />
                                            <span className="text-xs text-slate-500">pt</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 items-center">
                                <label className="text-xs text-slate-700">Position:</label>
                                <div className="col-span-2 flex items-center gap-2">
                                    <select value={position} onChange={(e) => setPosition(e.target.value)} className="w-24 border border-slate-300 rounded px-2 py-1 text-xs">
                                        <option value="normal">Normal</option>
                                        <option value="raised">Raised</option>
                                        <option value="lowered">Lowered</option>
                                    </select>
                                    {position !== 'normal' && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-slate-500">By:</span>
                                            <input type="number" value={positionBy} onChange={(e) => setPositionBy(Number(e.target.value))} className="w-14 border border-slate-300 rounded px-1 py-0.5 text-xs" />
                                            <span className="text-xs text-slate-500">pt</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <fieldset className="border border-slate-200 rounded px-3 py-2 mt-2">
                            <legend className="text-[10px] text-slate-500 px-1">OpenType Features</legend>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs text-slate-700">Ligatures:</label>
                                    <select value={ligatures} onChange={(e) => setLigatures(e.target.value)} className="w-32 border border-slate-300 rounded px-2 py-1 text-xs">
                                        <option value="none">None</option>
                                        <option value="standard">Standard only</option>
                                        <option value="all">All</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox label="Kerning for fonts:" checked={kerning} onChange={setKerning} />
                                    <input type="number" value={kerningMin} onChange={(e) => setKerningMin(Number(e.target.value))} className="w-12 border border-slate-300 rounded px-1 py-0.5 text-xs" disabled={!kerning} />
                                    <span className="text-xs text-slate-500">points and above</span>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                )}

                {/* Preview Box */}
                <div className="mt-6 border border-slate-300 rounded overflow-hidden">
                     <div className="bg-slate-50 px-2 py-1 border-b border-slate-200 text-[10px] text-slate-500">Preview</div>
                     <div className="h-16 flex items-center justify-center bg-white overflow-hidden px-4">
                         <span style={previewStyle}>
                             AaBbCcDdEeFfGg
                         </span>
                     </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 px-4 py-3 bg-slate-50 border-t border-slate-200">
                <button 
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-sm transition-all"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleApply}
                    className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium shadow-sm transition-all active:scale-95"
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
