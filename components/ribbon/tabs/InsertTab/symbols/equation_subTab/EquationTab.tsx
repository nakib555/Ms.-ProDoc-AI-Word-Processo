
import React, { useState, useRef, useEffect } from 'react';
import { RibbonSection } from '../../../../common/RibbonSection';
import { RibbonButton } from '../../../../common/RibbonButton';
import { SmallRibbonButton } from '../../../ViewTab/common/ViewTools';
import { MenuPortal } from '../../../../common/MenuPortal';
import { 
  Sigma, PenTool, Type, RefreshCw, 
  ChevronDown, ChevronUp, Check
} from 'lucide-react';
import { useEditor } from '../../../../../../contexts/EditorContext';

// --- Custom Icons for Structures ---

const FractionIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <rect x="8" y="4" width="8" height="6" strokeDasharray="2 2" opacity="0.5" />
    <rect x="8" y="14" width="8" height="6" strokeDasharray="2 2" opacity="0.5" />
  </svg>
);

const ScriptIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <rect x="4" y="10" width="10" height="10" strokeDasharray="2 2" opacity="0.5" />
    <rect x="16" y="4" width="6" height="6" strokeDasharray="2 2" opacity="0.5" />
  </svg>
);

const RadicalIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M4 14h3l3 7L16 4h6" />
    <rect x="12" y="8" width="8" height="8" strokeDasharray="2 2" opacity="0.5" stroke="none" fill="currentColor" fillOpacity="0.1" />
  </svg>
);

const IntegralIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M12 4c-2 0-4 2-4 4v8c0 2 2 4 4 4" strokeLinecap="round" />
    <path d="M12 20c2 0 4-2 4-4V8c0-2-2-4-4-4" strokeLinecap="round" />
  </svg>
);

const LargeOpIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M18 7V4H6v3l5 5-5 5v3h12v-3" />
  </svg>
);

const BracketIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M8 4H6v16h2" />
    <path d="M16 4h2v16h-2" />
    <rect x="9" y="7" width="6" height="10" strokeDasharray="2 2" opacity="0.5" />
  </svg>
);

const FunctionIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <text x="2" y="16" fontSize="10" fontFamily="serif" fill="currentColor">sin</text>
    <rect x="15" y="7" width="8" height="10" strokeDasharray="2 2" opacity="0.5" />
  </svg>
);

const AccentIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <text x="8" y="18" fontSize="14" fontFamily="serif" fill="currentColor">a</text>
    <circle cx="12" cy="4" r="1" fill="currentColor" />
    <circle cx="15" cy="4" r="1" fill="currentColor" />
  </svg>
);

const LimitIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <text x="4" y="12" fontSize="10" fontFamily="serif" fill="currentColor">lim</text>
    <rect x="4" y="14" width="16" height="6" strokeDasharray="2 2" opacity="0.5" />
  </svg>
);

const OperatorIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M12 18h-7l3.5-7 3.5-7 3.5 7 3.5 7z" fill="none" /> 
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </svg>
);

const MatrixIcon = (props: any) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <rect x="4" y="4" width="6" height="6" strokeDasharray="2 2" opacity="0.5" />
    <rect x="14" y="4" width="6" height="6" strokeDasharray="2 2" opacity="0.5" />
    <rect x="4" y="14" width="6" height="6" strokeDasharray="2 2" opacity="0.5" />
    <rect x="14" y="14" width="6" height="6" strokeDasharray="2 2" opacity="0.5" />
  </svg>
);

const SYMBOL_CATEGORIES: Record<string, string[]> = {
  'Basic Math': ['±', '∞', '=', '≠', '≈', '×', '÷', '!', '∝', '<', '≪', '>', '≫', '≤', '≥', '∓', '≅', '≡', '∀', '∁', '∂', '√', '∛', '∜', '∩', '∪', '∫', '∬', '∭', '∮', '∴', '∵', '∶', '∷', '∼', '≂', '⊕', '⊗', '⊥', '∆', '∇', '∃', '∉', '∌', '−', '∓', '∝', '∞', '∟', '∠', '∡', '∢', '∣', '∤', '∥', '∦', '∧', '∨', '∩', '∪', '∫', '∬', '∭', '∮', '∯', '∰', '∱', '∲', '∳'],
  'Greek Letters': [
    'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω',
    'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω'
  ],
  'Letter-Like Symbols': ['℃', '℉', '℀', '℁', 'ℂ', '℄', '℅', '℆', 'ℇ', '℈', '℉', 'ℊ', 'ℋ', 'ℌ', 'ℍ', 'ℎ', 'ℏ', 'ℐ', 'ℑ', 'ℒ', 'ℓ', '℔', 'ℕ', '№', '℗', '℘', 'ℙ', 'ℚ', 'ℛ', 'ℜ', 'ℝ', '℞', '℟', '℠', '℡', '™', '℣', 'ℤ', '℥', 'Ω', '℧', 'K', 'Å', '℮', 'ℯ'],
  'Operators': ['∑', '∏', '∐', '⋂', '⋃', '⋀', '⋁', '⨀', '⨂', '⨁', '⨄', '⨆', '⋆', '⋄', '∘', '∙', '∗', '·', '×', '÷', '⊎', '⊓', '⊔', '⊕', '⊖', '⊗', '⊘', '⊙', '⊚', '⊛', '⊜', '⊝', '⊞', '⊟', '⊠', '⊡'],
  'Arrows': ['←', '↑', '→', '↓', '↔', '↕', '↖', '↗', '↘', '↙', '↚', '↛', '↜', '↝', '↞', '↟', '↠', '↡', '↢', '↣', '↤', '↥', '↦', '↧', '↨', '↩', '↪', '↫', '↬', '↭', '↮', '↯', '↰', '↱', '↲', '↳', '↴', '↵', '↶', '↷', '↸', '↹', '↺', '↻', '↼', '↽', '↾', '↿', '⇀', '⇁', '⇂', '⇃', '⇄', '⇅', '⇆', '⇇', '⇈', '⇉', '⇊', '⇋', '⇌'],
  'Negated Relations': ['≠', '≮', '≯', '≰', '≱', '⊄', '⊅', '⊈', '⊉', '⊀', '⊁', '⊊', '⊋', '⊬', '⊭', '⊮', '⊯', '≂', '≃', '≄', '≅', '≆', '≇', '≈', '≉', '≊', '≋', '≌', '≍', '≎', '≏', '≐', '≑', '≒', '≓', '≔', '≕', '≖', '≗', '≘', '≙', '≚', '≛', '≜', '≝', '≞', '≟'],
  'Scripts': ['𝒜', 'ℬ', '𝒞', '𝒟', 'ℰ', 'ℱ', '𝒢', 'ℋ', 'ℐ', '𝒥', '𝒦', 'ℒ', 'ℳ', '𝒩', '𝒪', '𝒫', '𝒬', 'ℛ', '𝒮', '𝒯', '𝒰', '𝒱', '𝒲', '𝒳', '𝒴', '𝒵', '𝔞', '𝔟', '𝔠', '𝔡', '𝔢', '𝔣', '𝔤', '𝔥', '𝔦', '𝔧', '𝔨', '𝔩', '𝔪', '𝔫', '𝔬', '𝔭', '𝔮', '𝔯', '𝔰', '𝔱', '𝔲', '𝔳', '𝔴', '𝔵', '𝔶', '𝔷'],
  'Geometry': ['⊥', '∥', '∦', '∠', '∟', '∡', '∢', '⊾', '⊿', '⋈', '▱', '◆', '◇', '○', '◎', '●', '▰', '▱', '▲', '△', '▴', '▵', '▶', '▷', '▸', '▹', '►', '▻', '▼', '▽', '▾', '▿', '◀', '◁', '◂', '◃', '◄', '◅', '◆', '◇', '◈', '◉', '◊', '○', '◌', '◍', '◎', '●']
};

export const EquationTab: React.FC = () => {
  const { executeCommand } = useEditor();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [selectedCategory, setSelectedCategory] = useState('Basic Math');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [conversionType, setConversionType] = useState<'unicode' | 'latex'>('unicode');

  const insertSymbol = (symbol: string) => {
      executeCommand('insertText', symbol);
      if (activeMenu) setActiveMenu(null);
  };

  const insertStructure = (html: string) => {
      executeCommand('insertHTML', html);
  };

  const toggleGallery = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (activeMenu === 'symbol_gallery') {
          setActiveMenu(null);
      } else {
          if (triggerRef.current) {
              const rect = triggerRef.current.getBoundingClientRect();
              // Calculate position to align with the section
              setMenuPos({ top: rect.bottom, left: Math.max(10, rect.left - 262) }); 
          }
          setActiveMenu('symbol_gallery');
      }
  };

  const closeMenu = () => setActiveMenu(null);

  const scrollSymbols = (dir: 'up' | 'down') => {
      if (scrollContainerRef.current) {
          const amount = 56; // Approx 3 rows height
          scrollContainerRef.current.scrollBy({ top: dir === 'up' ? -amount : amount, behavior: 'smooth' });
      }
  };

  // Flatten basic math for the compact view
  const compactSymbols = SYMBOL_CATEGORIES['Basic Math'];

  // CSS Helpers
  const flexColCenter = "display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; margin: 0 2px;";
  const flexRowCenter = "display: inline-flex; align-items: center; vertical-align: middle;";
  const borderBottom = "border-bottom: 1px solid currentColor;";
  
  // Structure Definitions
  const fractionHTML = `<span style="${flexColCenter} vertical-align: -0.5em;"><span style="${borderBottom} padding: 0 2px;">x</span><span style="padding: 0 2px;">y</span></span>&nbsp;`;
  const scriptHTML = `x<sup>2</sup>`;
  const radicalHTML = `<span style="${flexRowCenter}"><span style="font-size: 1.5em; line-height: 1;">&radic;</span><span style="border-top: 1px solid currentColor; padding-top: 2px; margin-left: -2px;">x</span></span>&nbsp;`;
  const integralHTML = `<span style="${flexRowCenter}"><span style="font-size: 1.5em;">&int;</span><span style="${flexColCenter} margin-left: -4px;"><span style="font-size: 0.7em;">b</span><span style="font-size: 0.7em;">a</span></span><span style="margin-left: 4px;">x dx</span></span>&nbsp;`;
  const largeOpHTML = `<span style="${flexColCenter}"><span style="font-size: 0.7em;">n</span><span style="font-size: 1.4em; line-height: 1;">&sum;</span><span style="font-size: 0.7em;">i=0</span></span>&nbsp;`;
  const limitHTML = `<span style="${flexColCenter} margin-right: 4px;"><span style="font-family: 'Times New Roman', serif;">lim</span><span style="font-size: 0.7em;">n&rarr;&infin;</span></span>&nbsp;`;
  const matrixHTML = `<span style="${flexRowCenter}"><span style="font-size: 2.5em; font-weight: lighter;">[</span><span style="display: inline-grid; grid-template-columns: 1fr 1fr; gap: 4px 8px; margin: 0 4px; text-align: center;"><span>1</span><span>0</span><span>0</span><span>1</span></span><span style="font-size: 2.5em; font-weight: lighter;">]</span></span>&nbsp;`;
  const accentHTML = `<span style="${flexColCenter}"><span style="font-size: 0.5em;">^</span><span style="margin-top: -0.4em;">a</span></span>&nbsp;`;

  // Close category dropdown when clicking outside
  useEffect(() => {
    if (categoryOpen) {
        const handleClickOutside = () => setCategoryOpen(false);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [categoryOpen]);

  return (
    <>
      {/* Tools Group */}
      <RibbonSection title="Tools">
          <div className="flex gap-1 h-full">
            <RibbonButton 
                icon={Sigma} 
                label="Equation" 
                onClick={() => insertStructure('&nbsp;<span class="prodoc-equation" style="display: inline-block; border: 1px solid #cbd5e1; background-color: #f8fafc; padding: 4px 8px; margin: 0 2px; border-radius: 2px; min-width: 20px; text-align: center;"><span style="font-family: \'Cambria Math\', \'Times New Roman\', serif; font-style: italic; color: #64748b;">Type equation here.</span></span>&nbsp;')} 
                hasArrow 
                className="min-w-[60px]"
                title="Insert Equation Box"
            />
            <RibbonButton 
                icon={PenTool} 
                label="Ink Equation" 
                onClick={() => alert("Opens Ink Equation Editor")} 
                className="min-w-[70px]"
                title="Handwrite Equation"
            />
          </div>
      </RibbonSection>

      {/* Conversions Group */}
      <RibbonSection title="Conversions">
          <div className="flex flex-col justify-between h-full px-1 min-w-[110px] py-0.5">
             <div className="flex items-center gap-3 px-1 mb-1">
                 <button 
                    className="flex items-center gap-1.5 text-[11px] cursor-pointer rounded px-1 py-0.5 group"
                    onClick={() => setConversionType('unicode')}
                 >
                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${conversionType === 'unicode' ? 'border-blue-600 bg-blue-600' : 'border-slate-400 bg-white group-hover:border-blue-400'}`}>
                        {conversionType === 'unicode' && <div className="w-1 h-1 bg-white rounded-full"></div>}
                    </div>
                    <span className="text-slate-700">Unicode</span>
                 </button>
                 <button 
                    className="flex items-center gap-1.5 text-[11px] cursor-pointer rounded px-1 py-0.5 group"
                    onClick={() => setConversionType('latex')}
                 >
                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${conversionType === 'latex' ? 'border-blue-600 bg-blue-600' : 'border-slate-400 bg-white group-hover:border-blue-400'}`}>
                        {conversionType === 'latex' && <div className="w-1 h-1 bg-white rounded-full"></div>}
                    </div>
                    <span className="text-slate-700">LaTeX</span>
                 </button>
             </div>
             
             <div className="flex items-center gap-1 border-t border-slate-200 pt-1">
                 <SmallRibbonButton icon={Type} label="abc Text" onClick={() => {}} />
                 <div className="h-4 w-[1px] bg-slate-300 mx-0.5"></div>
                 <SmallRibbonButton icon={RefreshCw} label="Convert" onClick={() => {}} hasArrow />
             </div>
          </div>
      </RibbonSection>

      {/* Symbols Group */}
      <RibbonSection title="Symbols">
          <div className="flex h-full items-start gap-0 relative bg-white border border-slate-200 rounded-sm shadow-sm">
              {/* Compact Grid */}
              <div 
                ref={scrollContainerRef}
                className="grid grid-cols-8 gap-[1px] p-[1px] h-[74px] overflow-hidden w-[272px] bg-white content-start"
              >
                  {compactSymbols.map((sym, i) => (
                      <button 
                        key={i} 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => insertSymbol(sym)}
                        className="flex items-center justify-center hover:bg-blue-100 hover:text-blue-800 hover:ring-1 hover:ring-blue-300 hover:z-10 rounded-[1px] text-sm font-serif h-[18px] w-full transition-colors text-slate-700"
                        title={sym}
                      >
                          {sym}
                      </button>
                  ))}
              </div>
              
              {/* Controls */}
              <div className="flex flex-col h-full border-l border-slate-200 w-[18px] bg-slate-50">
                  <button 
                    onClick={() => scrollSymbols('up')}
                    className="flex-1 hover:bg-blue-200 flex items-center justify-center text-slate-500 hover:text-blue-700 border-b border-slate-200 active:bg-blue-300"
                  >
                      <ChevronUp size={8} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={() => scrollSymbols('down')}
                    className="flex-1 hover:bg-blue-200 flex items-center justify-center text-slate-500 hover:text-blue-700 border-b border-slate-200 active:bg-blue-300"
                  >
                      <ChevronDown size={8} strokeWidth={3} />
                  </button>
                  <button 
                    ref={triggerRef}
                    onClick={toggleGallery}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`flex-1 hover:bg-blue-200 flex items-center justify-center text-slate-500 hover:text-blue-700 transition-colors active:bg-blue-300 ${activeMenu ? 'bg-blue-200 text-blue-800 shadow-inner' : ''}`}
                    title="More Symbols"
                  >
                      <div className="flex flex-col items-center gap-[1px]">
                          <div className="w-2 h-[1px] bg-current rounded-full"></div>
                          <ChevronDown size={8} strokeWidth={3} />
                      </div>
                  </button>
              </div>
          </div>
          
          {/* Expanded Gallery Portal */}
          <MenuPortal 
            id="symbol_gallery" 
            activeMenu={activeMenu} 
            menuPos={menuPos} 
            closeMenu={closeMenu} 
            width={340}
          >
              <div className="flex flex-col bg-white rounded-b-lg shadow-xl border border-slate-300 overflow-hidden h-[320px] animate-in slide-in-from-top-1 duration-100">
                  {/* Header / Category Selector */}
                  <div className="bg-slate-50 px-2 py-2 border-b border-slate-200 flex items-center justify-between shrink-0 relative z-20">
                      <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wide ml-1">Symbol:</span>
                      <div className="relative">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setCategoryOpen(!categoryOpen); }}
                            className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-300 rounded shadow-sm hover:border-blue-400 text-xs font-medium text-slate-700 min-w-[160px] justify-between transition-all"
                          >
                              <span className="truncate">{selectedCategory}</span>
                              <ChevronDown size={12} className="text-slate-400" />
                          </button>
                          
                          {/* Custom Category Dropdown */}
                          {categoryOpen && (
                              <div className="absolute top-full right-0 mt-1 w-[180px] bg-white border border-slate-200 shadow-lg rounded-md py-1 z-50 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                                  {Object.keys(SYMBOL_CATEGORIES).map(cat => (
                                      <button
                                        key={cat}
                                        onClick={(e) => { e.stopPropagation(); setSelectedCategory(cat); setCategoryOpen(false); }}
                                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 flex items-center justify-between ${selectedCategory === cat ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}`}
                                      >
                                          {cat}
                                          {selectedCategory === cat && <Check size={12} className="text-blue-600" />}
                                      </button>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Scrollable Grid */}
                  <div className="flex-1 overflow-y-auto p-3 bg-white scrollbar-thin scrollbar-thumb-slate-300">
                      <div className="grid grid-cols-10 gap-1">
                          {SYMBOL_CATEGORIES[selectedCategory].map((sym, i) => (
                              <button 
                                key={i}
                                onClick={() => insertSymbol(sym)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 hover:scale-110 hover:shadow-sm rounded-md transition-all text-base text-slate-700 font-serif border border-transparent"
                                title={sym}
                              >
                                  {sym}
                              </button>
                          ))}
                      </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="bg-slate-50 px-3 py-2 border-t border-slate-200 text-[11px] text-slate-500 flex justify-start items-center gap-4 font-medium">
                      <button onClick={() => insertSymbol(' ')} className="text-slate-600 hover:text-blue-600 hover:underline">AutoCorrect...</button>
                  </div>
              </div>
          </MenuPortal>
      </RibbonSection>

      {/* Structures Group */}
      <RibbonSection title="Structures">
          <div className="flex items-center gap-0.5 h-full px-1">
              <RibbonButton icon={FractionIcon} label="Fraction" onClick={() => insertStructure(fractionHTML)} hasArrow />
              <RibbonButton icon={ScriptIcon} label="Script" onClick={() => insertStructure(scriptHTML)} hasArrow />
              <RibbonButton icon={RadicalIcon} label="Radical" onClick={() => insertStructure(radicalHTML)} hasArrow />
              <RibbonButton icon={IntegralIcon} label="Integral" onClick={() => insertStructure(integralHTML)} hasArrow />
              <RibbonButton icon={LargeOpIcon} label="Large Operator" onClick={() => insertStructure(largeOpHTML)} hasArrow />
              <RibbonButton icon={BracketIcon} label="Bracket" onClick={() => insertStructure('(x)')} hasArrow />
              <RibbonButton icon={FunctionIcon} label="Function" onClick={() => insertStructure('sin(&theta;)')} hasArrow />
              <RibbonButton icon={AccentIcon} label="Accent" onClick={() => insertStructure(accentHTML)} hasArrow />
              <RibbonButton icon={LimitIcon} label="Limit and Log" onClick={() => insertStructure(limitHTML)} hasArrow />
              <RibbonButton icon={OperatorIcon} label="Operator" onClick={() => insertStructure(' &rarr; ')} hasArrow />
              <RibbonButton icon={MatrixIcon} label="Matrix" onClick={() => insertStructure(matrixHTML)} hasArrow />
          </div>
      </RibbonSection>
    </>
  );
};
