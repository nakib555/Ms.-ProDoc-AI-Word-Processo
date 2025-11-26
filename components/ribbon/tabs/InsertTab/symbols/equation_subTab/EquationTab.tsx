
import React from 'react';
import { RibbonSection } from '../../../../common/RibbonSection';
import { RibbonButton } from '../../../../common/RibbonButton';
import { SmallRibbonButton } from '../../../ViewTab/common/ViewTools';
import { 
  Sigma, PenTool, Type, RefreshCw, 
  ChevronDown, ChevronUp, ArrowDown
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


export const EquationTab: React.FC = () => {
  const { executeCommand } = useEditor();

  const insertSymbol = (symbol: string) => {
      executeCommand('insertText', symbol);
  };

  const insertStructure = (html: string) => {
      executeCommand('insertHTML', html);
  };

  // CSS Helpers for readability
  const flexColCenter = "display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; margin: 0 2px;";
  const flexRowCenter = "display: inline-flex; align-items: center; vertical-align: middle;";
  const tableStyle = "display: inline-table; vertical-align: middle; border-collapse: collapse; margin: 0 4px;";
  const cellStyle = "padding: 0 2px; text-align: center; display: block;";
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
             <div className="flex items-center gap-3 px-1">
                 <button className="flex items-center gap-1.5 text-[11px] cursor-pointer hover:bg-slate-100 rounded px-1 py-0.5 text-slate-700">
                    <div className="w-3 h-3 rounded-full border border-blue-500 bg-blue-500 relative">
                        <div className="absolute inset-0 m-auto w-1 h-1 bg-white rounded-full"></div>
                    </div>
                    <span>Unicode</span>
                 </button>
                 <button className="flex items-center gap-1.5 text-[11px] cursor-pointer hover:bg-slate-100 rounded px-1 py-0.5 text-slate-600">
                    <div className="w-3 h-3 rounded-full border border-slate-400 bg-white"></div>
                    <span>LaTeX</span>
                 </button>
             </div>
             
             <div className="flex items-center gap-1 border-t border-slate-100 pt-0.5">
                 <SmallRibbonButton icon={Type} label="abc Text" onClick={() => {}} />
                 <div className="h-4 w-[1px] bg-slate-300 mx-0.5"></div>
                 <SmallRibbonButton icon={RefreshCw} label="Convert" onClick={() => {}} hasArrow />
             </div>
          </div>
      </RibbonSection>

      {/* Symbols Group */}
      <RibbonSection title="Symbols">
          <div className="flex h-full items-start gap-0">
              <div className="grid grid-cols-6 gap-[2px] p-[2px] h-[76px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 w-[190px] bg-white border border-slate-200 rounded-sm content-start">
                  {[
                      '±', '∞', '=', '≠', '≈', '×', 
                      '÷', '!', '∝', '<', '≪', '>', 
                      '≫', '≤', '≥', '∓', '≅', '≡',
                      '∀', '∁', '∂', '√', '∛', '∜',
                      '∩', '∪', '∫', '∬', '∭', '∮',
                      '∴', '∵', '∶', '∷', '∼', '≂',
                      '⊕', '⊗', '⊥', '∆', '∇', '∃'
                  ].map(sym => (
                      <button 
                        key={sym} 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => insertSymbol(sym)}
                        className="flex items-center justify-center hover:bg-blue-100 hover:text-blue-700 rounded-[2px] text-sm font-serif h-5 w-full transition-colors"
                      >
                          {sym}
                      </button>
                  ))}
              </div>
              <div className="flex flex-col h-full border-l border-slate-200 ml-1 pl-0.5 justify-between py-0.5 gap-0.5">
                  <button className="p-0.5 hover:bg-slate-200 rounded text-slate-500 h-5 flex items-center justify-center"><ChevronUp size={10}/></button>
                  <button className="p-0.5 hover:bg-slate-200 rounded text-slate-500 h-5 flex items-center justify-center"><ChevronDown size={10}/></button>
                  <button className="p-0.5 hover:bg-slate-200 rounded text-slate-500 h-5 flex items-center justify-center"><ArrowDown size={10}/></button>
              </div>
          </div>
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
