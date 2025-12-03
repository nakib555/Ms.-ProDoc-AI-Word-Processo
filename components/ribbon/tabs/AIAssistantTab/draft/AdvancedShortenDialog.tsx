
import React, { useState, useEffect } from 'react';
import { 
  X, Scissors, Minus, List, AlignLeft, 
  Zap, MessageSquare, Check, RefreshCw, Copy, ArrowRight, 
  ArrowLeft, Sliders, Trash2, ShieldCheck, Lock, Brain, Settings2
} from 'lucide-react';
import { generateAIContent } from '../../../../../services/geminiService';
import { jsonToHtml } from '../../../../../utils/documentConverter';

interface AdvancedShortenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  onInsert: (text: string) => void;
}

const SHORTEN_STRATEGIES = [
  { id: 'percent', label: 'Reduce by %', icon: Sliders, desc: 'Shrink length by amount.' },
  { id: 'summary', label: 'Summary', icon: AlignLeft, desc: 'Concise overview.' },
  { id: 'bullet', label: 'Bullet Points', icon: List, desc: 'Convert to list.' },
  { id: 'cleanup', label: 'Cleanup', icon: Trash2, desc: 'Remove fillers only.' },
  { id: 'sentences', label: 'Simplify', icon: Minus, desc: 'Shorten sentences.' },
];

const SettingToggle = ({ label, checked, onChange, icon: Icon, description }: any) => (
  <div 
    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${checked ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700'}`}
    onClick={onChange}
  >
    <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg transition-colors ${checked ? 'bg-orange-100 text-orange-600 dark:bg-orange-800 dark:text-orange-200' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 group-hover:bg-slate-200'}`}>
                <Icon size={16} />
            </div>
            <span className={`text-xs font-semibold ${checked ? 'text-orange-900 dark:text-orange-100' : 'text-slate-600 dark:text-slate-300'}`}>{label}</span>
        </div>
        {description && <span className="text-[10px] text-slate-400 ml-10 leading-tight">{description}</span>}
    </div>
    <div className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${checked ? 'bg-orange-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
      <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform shadow-sm ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
  </div>
);

export const AdvancedShortenDialog: React.FC<AdvancedShortenDialogProps> = ({
  isOpen,
  onClose,
  initialText,
  onInsert
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [activeTab, setActiveTab] = useState<'input' | 'preview'>('input');
  const [mobileView, setMobileView] = useState<'editor' | 'sidebar'>('editor');

  // Settings State
  const [strategy, setStrategy] = useState('percent');
  const [intensity, setIntensity] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');

  // Advanced Options
  const [constraintType, setConstraintType] = useState<'none' | 'chars' | 'words'>('none');
  const [constraintValue, setConstraintValue] = useState(100);
  const [keepMeaning, setKeepMeaning] = useState(true);
  const [smartCompression, setSmartCompression] = useState(false);
  const [removeFillers, setRemoveFillers] = useState(false);
  const [toneMode, setToneMode] = useState<'preserve' | 'neutral' | 'emotional'>('preserve');

  useEffect(() => {
      if (isOpen) {
          setInputText(initialText);
          setResult('');
          setActiveTab('input');
          setMobileView('editor');
      }
  }, [isOpen, initialText]);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    setResult('');
    setActiveTab('preview');
    setMobileView('editor'); // Switch back to main view on mobile to show result

    let instruction = "";
    
    switch(strategy) {
        case 'percent':
            const level = intensity < 30 ? "Slightly" : intensity > 70 ? "Heavily" : "Moderately";
            instruction += `Shorten the text by approximately ${intensity}%. Level: ${level} reduction. `;
            break;
        case 'summary':
            instruction += `Create an ultra-short summary (1-3 sentences) capturing the essence. `;
            break;
        case 'bullet':
            instruction += `Convert the text into concise bullet points. Remove fluff. `;
            break;
        case 'cleanup':
            instruction += `Keep all ideas but remove redundancy, repetition, and verbose phrasing. `;
            break;
        case 'sentences':
            instruction += `Keep all content but rewrite complex sentences to be shorter and punchier. `;
            break;
    }

    if (removeFillers) instruction += "Strictly remove filler words (e.g., 'very', 'basically', 'actually'). ";
    if (smartCompression) instruction += "SMART COMPRESSION: You MUST preserve specific dates, names, numbers, and key facts. ";
    if (keepMeaning) instruction += "Ensure the core meaning remains exactly the same, do not alter the message. ";

    if (toneMode === 'neutral') instruction += "Change tone to be completely neutral and objective. ";
    else if (toneMode === 'emotional') instruction += "Preserve or slightly enhance the emotional weight of the text. ";
    else instruction += "Preserve the original tone and voice. ";

    if (constraintType === 'chars') instruction += `STRICT LIMIT: The output must be under ${constraintValue} characters. `;
    if (constraintType === 'words') instruction += `STRICT LIMIT: The output must be under ${constraintValue} words. `;

    const prompt = `
      TASK: Shorten and rewrite the input text based on these specific rules.
      
      RULES:
      ${instruction}
      
      INPUT TEXT:
      "${inputText}"
      
      OUTPUT FORMAT:
      Return a VALID JSON object matching the ProDoc schema (document.blocks array).
      Do not wrap in markdown code blocks.
    `;

    try {
      const response = await generateAIContent('generate_content', '', prompt, 'gemini-3-pro-preview');
      
      let cleanJson = response.trim();
      const codeBlockMatch = cleanJson.match(/```(?:json)?([\s\S]*?)```/);
      if (codeBlockMatch) cleanJson = codeBlockMatch[1].trim();
      
      if (cleanJson.indexOf('{') > 0) cleanJson = cleanJson.substring(cleanJson.indexOf('{'));
      if (cleanJson.lastIndexOf('}') < cleanJson.length - 1) cleanJson = cleanJson.substring(0, cleanJson.lastIndexOf('}') + 1);

      try {
          const parsed = JSON.parse(cleanJson);
          if (parsed.error) {
              setResult(`<div class="p-4 bg-red-50 text-red-600 border border-red-200 rounded">${parsed.error}</div>`);
          } else {
              const html = jsonToHtml(parsed);
              setResult(html);
          }
      } catch (e) {
          setResult(`<p>${response.replace(/\n/g, '<br/>')}</p>`);
      }
    } catch (e) {
      console.error(e);
      setResult('<p class="text-red-500">Generation failed. Please try again.</p>');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-[4px] transition-opacity animate-in fade-in duration-300"
          onClick={onClose}
      />
      
      <div 
        className={`
            relative w-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all duration-500 z-20
            
            /* Unified Floating Styles */
            h-[75vh] md:h-[85vh] 
            rounded-2xl md:rounded-3xl 
            border border-white/20 dark:border-slate-700 
            ring-1 ring-black/5 dark:ring-white/5
            
            md:max-w-6xl 
            
            animate-in zoom-in-95 ease-out
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Left Panel: Configuration */}
        <div className={`
            flex-col bg-slate-50/90 dark:bg-slate-950/90 border-r border-slate-200 dark:border-slate-800 backdrop-blur-xl shrink-0 transition-all duration-300 z-20
            md:w-[360px] md:flex
            ${mobileView === 'sidebar' ? 'flex w-full h-full pt-8 md:pt-0' : 'hidden'}
        `}>
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        {/* Mobile Back Button */}
                        <button 
                            onClick={() => setMobileView('editor')}
                            className="md:hidden p-1 -ml-2 mr-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                            <Scissors size={18} />
                        </div>
                        Smart Shorten
                    </h2>
                    {/* Mobile Close */}
                    <button onClick={onClose} className="md:hidden text-slate-400">
                        <X size={20} />
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-1 ml-9 md:ml-0">Condense content intelligently.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
                {/* Strategy Selection */}
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Reduction Strategy</label>
                    <div className="grid grid-cols-2 gap-2">
                        {SHORTEN_STRATEGIES.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setStrategy(s.id)}
                                className={`flex flex-col p-2.5 rounded-xl border text-left transition-all group relative overflow-hidden ${
                                    strategy === s.id 
                                    ? 'bg-orange-600 border-orange-600 text-white shadow-md' 
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-orange-300 dark:hover:border-slate-500'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <s.icon size={16} className={strategy === s.id ? 'text-white' : 'text-orange-600 dark:text-orange-400'} />
                                    {strategy === s.id && <Check size={12} className="text-white" strokeWidth={3} />}
                                </div>
                                <div className="text-xs font-bold">{s.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Percentage Slider */}
                {strategy === 'percent' && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-top-2">
                         <div className="flex justify-between items-center mb-3">
                            <label className="text-xs font-bold text-slate-500">Reduction Amount</label>
                            <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-200 font-bold">{intensity}%</span>
                        </div>
                        <input 
                            type="range" min="10" max="90" step="10" value={intensity}
                            onChange={(e) => setIntensity(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wide">
                            <span>Slight</span>
                            <span>Heavy</span>
                        </div>
                    </div>
                )}

                {/* Smart Toggles */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Refinements</label>
                    
                    <SettingToggle 
                        label="Smart Compression" 
                        description="Preserves dates, names, and key facts."
                        checked={smartCompression} 
                        onChange={() => setSmartCompression(!smartCompression)}
                        icon={ShieldCheck}
                    />

                    <SettingToggle 
                        label="Remove Filler Words" 
                        description="Cuts 'basically', 'very', 'actually'..."
                        checked={removeFillers} 
                        onChange={() => setRemoveFillers(!removeFillers)}
                        icon={Trash2}
                    />

                    <SettingToggle 
                        label="Preserve Meaning" 
                        description="Ensures core message stays identical."
                        checked={keepMeaning} 
                        onChange={() => setKeepMeaning(!keepMeaning)}
                        icon={Lock}
                    />
                </div>

                {/* Tone & Constraints */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tone</label>
                         <div className="flex flex-col gap-1">
                             {['preserve', 'neutral', 'emotional'].map(t => (
                                 <button 
                                    key={t}
                                    onClick={() => setToneMode(t as any)}
                                    className={`px-3 py-2 rounded-lg text-[10px] font-bold border text-left transition-all ${toneMode === t ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-700 dark:border-slate-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                                 >
                                     {t.charAt(0).toUpperCase() + t.slice(1)}
                                 </button>
                             ))}
                         </div>
                    </div>

                    <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Max Limit</label>
                         <div className="flex flex-col gap-2">
                             <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                                 {['none', 'chars', 'words'].map(c => (
                                     <button
                                        key={c}
                                        onClick={() => setConstraintType(c as any)}
                                        className={`flex-1 py-1 text-[9px] font-bold rounded-md transition-all uppercase ${constraintType === c ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400'}`}
                                     >
                                         {c === 'none' ? 'Off' : c}
                                     </button>
                                 ))}
                             </div>
                             {constraintType !== 'none' && (
                                 <input 
                                    type="number" 
                                    value={constraintValue}
                                    onChange={(e) => setConstraintValue(parseInt(e.target.value))}
                                    className="w-full p-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 outline-none focus:border-orange-500 text-center font-mono"
                                 />
                             )}
                         </div>
                    </div>
                </div>
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !inputText.trim()}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-200/50 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                    {isGenerating ? <RefreshCw className="animate-spin" size={18}/> : <Zap size={18} className="fill-orange-200 text-orange-100" />}
                    {isGenerating ? 'Shortening...' : 'Shorten Text'}
                </button>
            </div>
        </div>

        {/* Main: Editor/Preview Panel */}
        <div className={`
            flex-col bg-[#f8fafc] dark:bg-slate-950 min-w-0 relative flex-1
            md:flex
            ${mobileView === 'editor' ? 'flex w-full h-full pt-8 md:pt-0' : 'hidden'}
        `}>
            {/* Header */}
            <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0">
                {/* Mobile Sidebar Toggle */}
                <button 
                    onClick={() => setMobileView('sidebar')}
                    className="md:hidden p-2 -ml-2 mr-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                    <Settings2 size={20} />
                    <span className="text-xs font-bold">Settings</span>
                </button>

                 <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('input')}
                        className={`px-4 md:px-6 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all ${activeTab === 'input' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        Original
                    </button>
                    <button 
                        onClick={() => { if(result || isGenerating) setActiveTab('preview'); }}
                        disabled={!result && !isGenerating}
                        className={`px-4 md:px-6 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all flex items-center gap-2 ${activeTab === 'preview' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                    >
                        Shortened {result && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                    </button>
                 </div>
                 <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Content View */}
            <div className="flex-1 overflow-hidden relative">
                {/* Input View */}
                <div className={`absolute inset-0 flex flex-col transition-all duration-300 ${activeTab === 'input' ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 -translate-x-10 pointer-events-none'}`}>
                    <textarea 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="flex-1 w-full p-6 md:p-8 resize-none outline-none text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300 bg-transparent placeholder:text-slate-400 font-serif"
                        placeholder="Paste or type text to shorten..."
                    />
                    <div className="px-6 md:px-8 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 flex justify-between font-medium shrink-0">
                        <span>{inputText.split(/\s+/).filter(w => w.length > 0).length} words</span>
                        <span>{inputText.length} characters</span>
                    </div>
                </div>

                {/* Preview View */}
                <div className={`absolute inset-0 flex flex-col transition-all duration-300 bg-slate-50 dark:bg-slate-950 ${activeTab === 'preview' ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 translate-x-10 pointer-events-none'}`}>
                     {isGenerating ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                            <div className="space-y-6">
                                <div className="relative mx-auto w-20 h-20">
                                    <div className="absolute inset-0 border-4 border-orange-100 dark:border-slate-800 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                                    <Brain size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500 animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Compressing content...</p>
                                    <p className="text-xs mt-1 opacity-70">Applying smart filters and tone adjustments.</p>
                                </div>
                            </div>
                        </div>
                    ) : result ? (
                        <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-6 md:p-10 animate-in slide-in-from-top-4 fade-in duration-500">
                             <div 
                                className="prose prose-sm md:prose-base dark:prose-invert max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"
                                dangerouslySetInnerHTML={{ __html: result }}
                            />
                            <div className="max-w-3xl mx-auto mt-6 flex justify-between text-xs text-slate-400 font-medium px-4 py-3 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg">
                                <span>Original: <span className="font-mono text-slate-600 dark:text-slate-300">{inputText.length}</span> chars</span>
                                <span className="text-orange-600 dark:text-orange-400">New: <span className="font-mono font-bold">{result.replace(/<[^>]*>?/gm, '').length}</span> chars</span>
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center opacity-60">
                            <div className="space-y-4 max-w-sm">
                                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-200 dark:border-slate-700 shadow-sm rotate-3 transition-transform hover:rotate-0 duration-500">
                                    <MessageSquare size={40} className="text-orange-300"/>
                                </div>
                                <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">Ready to Shorten</h3>
                                <p className="text-sm leading-relaxed">
                                    Configure your reduction strategy in Settings and click Generate.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Result Actions */}
            <div className="h-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-end px-6 gap-4 shrink-0">
                {result && activeTab === 'preview' && (
                    <>
                        <button 
                            onClick={() => navigator.clipboard.writeText(result.replace(/<[^>]*>?/gm, ''))}
                            className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors"
                        >
                            <Copy size={18} /> <span className="hidden sm:inline">Copy</span>
                        </button>
                        <button 
                            onClick={() => { onInsert(result); onClose(); }}
                            className="px-8 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-200/50 dark:shadow-none transition-all flex items-center gap-2 active:scale-95"
                        >
                            <ArrowRight size={20} /> Insert
                        </button>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
