
import React, { useState, useRef } from 'react';
import { RibbonSection } from '../../../../common/RibbonSection';
import { RibbonButton } from '../../../../common/RibbonButton';
import { SmallRibbonButton } from '../../../ViewTab/common/ViewTools';
import { MenuPortal } from '../../../../common/MenuPortal';
import { 
  Sigma, PenTool, Type, RefreshCw, 
  ChevronDown, Check, ArrowUp, ArrowDown,
  Calculator, Percent, Ban, ScrollText, Triangle, ArrowRight, Activity,
  Plus, Divide
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

const CATEGORY_ICONS: Record<string, any> = {
  'Basic Math': Plus,
  'Greek Letters': Sigma,
  'Letter-Like Symbols': Type,
  'Operators': Divide,
  'Arrows': ArrowRight,
  'Negated Relations': Ban,
  'Scripts': ScrollText,
  'Geometry': Triangle
};

// Custom Structure Button Component
const StructureButton: React.FC<{
  icon: any;
  label: string;
  onClick: () => void;
  className?: string;
  hasArrow?: boolean;
}> = ({ icon: Icon, label, onClick, className, hasArrow }) => (
  <button
    className={`flex flex-col items-center justify-center px-1 py-1 min-w-[56px] h-full rounded-lg transition-all duration-200 group relative text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex-shrink-0 ${className || ''}`}
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    title={label}
  >
    <div className="p-1.5 rounded-md group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:shadow-sm transition-all mb-0.5 bg-transparent">
        <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" strokeWidth={1.5} />
    </div>
    <div className="flex items-center justify-center w-full px-0.5">
        <span className="text-[10px] font-medium leading-tight text-center text-slate-500 dark:text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400 truncate w-full">{label}</span>
        {hasArrow && <ChevronDown size={8} className="ml-0.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0" />}
    </div>
  </button>
);

const SymbolCategoryDropdown: React.FC<{ category: string }> = ({ category }) => {
    const { executeCommand } = useEditor();
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const Icon = CATEGORY_ICONS[category] || Calculator;
    const symbols = SYMBOL_CATEGORIES[category];

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({ top: rect.bottom + 2, left: rect.left });
        }
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggle}
                className={`flex items-center gap-2 px-3 py-1.5 text-[11px] rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent transition-all w-full text-left group ${isOpen ? 'bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}
                title={category}
                onMouseDown={(e) => e.preventDefault()}
            >
                <Icon size={14} className={`shrink-0 ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}/>
                <span className="whitespace-nowrap font-medium truncate flex-1">{category}</span>
                <ChevronDown size={10} className={`shrink-0 transition-transform text-slate-400 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
            </button>

            <MenuPortal 
                id={`sym-${category}`}
                activeMenu={isOpen ? `sym-${category}` : null}
                menuPos={coords}
                closeMenu={() => setIsOpen(false)}
                width={320}
            >
                <div className="p-2 bg-white dark:bg-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1 flex justify-between items-center">
                        {category}
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">{symbols.length}</span>
                    </div>
                    <div className="grid grid-cols-8 gap-1 max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600 p-1 border border-slate-100 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900/50">
                        {symbols.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => { executeCommand('insertText', s); setIsOpen(false); }}
                                onMouseDown={(e) => e.preventDefault()}
                                className="h-8 w-8 flex items-center justify-center text-sm text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all font-serif select-none"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </MenuPortal>
        </>
    );
};

const SymbolGallery = () => {
    return (
        <div className="grid grid-rows-4 md:grid-rows-2 grid-flow-col gap-x-4 gap-y-1.5 h-full px-2 min-w-[320px]">
            {Object.keys(SYMBOL_CATEGORIES).map(cat => (
                <SymbolCategoryDropdown key={cat} category={cat} />
            ))}
        </div>
    );
};

export const EquationTab: React.FC = () => {
  const { executeCommand } = useEditor();
  const [conversionType, setConversionType] = useState<'unicode' | 'latex'>('unicode');
  
  const insertStructure = (html: string) => {
      executeCommand('insertHTML', html);
  };

  // CSS Helpers
  const flexColCenter = "display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; margin: 0 2px;";
  const flexRowCenter = "display: inline-flex; align-items: center; vertical-align: middle;";
  const borderBottom = "border-bottom: 1px solid currentColor;";
  
  // Dotted box placeholder for math zones
  const placeholder = `<span style="border: 1px dotted #94a3b8; min-width: 12px; min-height: 12px; display: inline-block; background-color: rgba(0,0,0,0.02); margin: 0 1px;">&nbsp;</span>`;

  const fractionHTML = `<span style="${flexColCenter} vertical-align: -0.5em;"><span style="${borderBottom} padding: 0 2px;">${placeholder}</span><span style="padding: 0 2px;">${placeholder}</span></span>&nbsp;`;
  const scriptHTML = `${placeholder}<sup>${placeholder}</sup>`;
  const radicalHTML = `<span style="${flexRowCenter}"><span style="font-size: 1.5em; line-height: 1;">&radic;</span><span style="border-top: 1px solid currentColor; padding-top: 2px; margin-left: -2px;">${placeholder}</span></span>&nbsp;`;
  const integralHTML = `<span style="${flexRowCenter}"><span style="font-size: 1.5em;">&int;</span><span style="${flexColCenter} margin-left: -4px;"><span style="font-size: 0.7em;">${placeholder}</span><span style="font-size: 0.7em;">${placeholder}</span></span><span style="margin-left: 4px;">${placeholder}dx</span></span>&nbsp;`;
  const largeOpHTML = `<span style="${flexColCenter}"><span style="font-size: 0.7em;">${placeholder}</span><span style="font-size: 1.4em; line-height: 1;">&sum;</span><span style="font-size: 0.7em;">${placeholder}</span></span>&nbsp;`;
  const limitHTML = `<span style="${flexColCenter} margin-right: 4px;"><span style="font-family: 'Times New Roman', serif;">lim</span><span style="font-size: 0.7em;">n&rarr;&infin;</span></span>&nbsp;`;
  const matrixHTML = `<span style="${flexRowCenter}"><span style="font-size: 2.5em; font-weight: lighter;">[</span><span style="display: inline-grid; grid-template-columns: 1fr 1fr; gap: 4px 8px; margin: 0 4px; text-align: center;"><span>${placeholder}</span><span>${placeholder}</span><span>${placeholder}</span><span>${placeholder}</span></span><span style="font-size: 2.5em; font-weight: lighter;">]</span></span>&nbsp;`;
  const accentHTML = `<span style="${flexColCenter}"><span style="font-size: 0.5em;">^</span><span style="margin-top: -0.4em;">${placeholder}</span></span>&nbsp;`;

  return (
    <>
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

      <RibbonSection title="Conversions">
          <div className="flex flex-col justify-between h-full px-1 min-w-[110px] py-0.5">
             <div className="flex items-center gap-3 px-1 mb-1">
                 <button 
                    className="flex items-center gap-1.5 text-[11px] cursor-pointer rounded px-1 py-0.5 group"
                    onClick={() => setConversionType('unicode')}
                 >
                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-colors ${conversionType === 'unicode' ? 'border-blue-600 bg-blue-600' : 'border-slate-400 bg-white group-hover:border-blue-400'}`}>
                        {conversionType === 'unicode' && <div className="w-1 h-1 bg-white rounded-full"></div>}
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">Unicode</span>
                 </button>
                 <button 
                    className="flex items-center gap-1.5 text-[11px] cursor-pointer rounded px-1 py-0.5 group"
                    onClick={() => setConversionType('latex')}
                 >
                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-colors ${conversionType === 'latex' ? 'border-blue-600 bg-blue-600' : 'border-slate-400 bg-white group-hover:border-blue-400'}`}>
                        {conversionType === 'latex' && <div className="w-1 h-1 bg-white rounded-full"></div>}
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">LaTeX</span>
                 </button>
             </div>
             
             <div className="flex items-center gap-1 border-t border-slate-200 dark:border-slate-700 pt-1">
                 <SmallRibbonButton icon={Type} label="abc Text" onClick={() => {}} />
                 <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-600 mx-0.5"></div>
                 <SmallRibbonButton icon={RefreshCw} label="Convert" onClick={() => {}} hasArrow />
             </div>
          </div>
      </RibbonSection>

      <RibbonSection title="Symbols">
          <SymbolGallery />
      </RibbonSection>

      <RibbonSection title="Structures">
          <div className="flex items-center gap-0.5 h-full px-1">
              <StructureButton icon={FractionIcon} label="Fraction" onClick={() => insertStructure(fractionHTML)} hasArrow />
              <StructureButton icon={ScriptIcon} label="Script" onClick={() => insertStructure(scriptHTML)} hasArrow />
              <StructureButton icon={RadicalIcon} label="Radical" onClick={() => insertStructure(radicalHTML)} hasArrow />
              <StructureButton icon={IntegralIcon} label="Integral" onClick={() => insertStructure(integralHTML)} hasArrow />
              <StructureButton icon={LargeOpIcon} label="Large Operator" onClick={() => insertStructure(largeOpHTML)} hasArrow />
              <StructureButton icon={BracketIcon} label="Bracket" onClick={() => insertStructure('(x)')} hasArrow />
              <StructureButton icon={FunctionIcon} label="Function" onClick={() => insertStructure('sin(&theta;)')} hasArrow />
              <StructureButton icon={AccentIcon} label="Accent" onClick={() => insertStructure(accentHTML)} hasArrow />
              <StructureButton icon={LimitIcon} label="Limit and Log" onClick={() => insertStructure(limitHTML)} hasArrow />
              <StructureButton icon={OperatorIcon} label="Operator" onClick={() => insertStructure(' &rarr; ')} hasArrow />
              <StructureButton icon={MatrixIcon} label="Matrix" onClick={() => insertStructure(matrixHTML)} hasArrow />
          </div>
      </RibbonSection>
    </>
  );
};
