import React, { useState, Suspense, useEffect } from 'react';
// FIX: Import missing icons used in the component.
import { LayoutTemplate, Sparkles, FileText, Feather, Activity, BookOpen, Loader2, ChevronDown, AlignLeft, Zap, Wand2, AlertTriangle, Smile, GraduationCap } from 'lucide-react';
import { useAIAssistantTab } from '../../AIAssistantTabContext';
import { useAI } from '../../../../../../hooks/useAI';
import { MenuPortal } from '../../../../common/MenuPortal';
import { ErrorBoundary } from '../../../../../ErrorBoundary';
import { getSmartDocPrompt } from '../../../../../../services/prompts/tools/draft';

// Lazy load the PredictiveBuilder to reduce initial bundle size
const PredictiveBuilder = React.lazy(() => 
  import('./TemplatesCollection/TemplatesCollection')
    .then(module => ({ default: module.PredictiveBuilder }))
    .catch(err => {
        console.error("Failed to load TemplatesCollection", err);
        return { default: () => (
            <div className="p-8 text-center text-red-500 flex flex-col items-center gap-2">
                <AlertTriangle size={24} />
                <p className="text-xs">Failed to load templates. Please reload.</p>
            </div>
        )};
    })
);

const TONES = [
  { id: 'Professional', label: 'Professional', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
  { id: 'Friendly', label: 'Friendly', icon: Smile, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
  { id: 'Persuasive', label: 'Persuasive', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
  { id: 'Instructional', label: 'Instructional', icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' },
  { id: 'Creative', label: 'Creative', icon: Feather, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-800' },
  { id: 'Academic', label: 'Academic', icon: GraduationCap, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700' },
];

export const SmartDocTemplateTool: React.FC = () => {
  const { performAIAction } = useAI();
  const { activeMenu, menuPos, closeMenu, toggleMenu, registerTrigger } = useAIAssistantTab();
  
  const menuId = 'smart_doc_template_options';
  const isActive = activeMenu === menuId;

  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('Professional');

  useEffect(() => {
      if (!isActive) {
          setShowBuilder(false);
          // Reset to a default when menu is closed to ensure clean state on reopen
          setSelectedStyle('Professional');
      }
  }, [isActive]);

  const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Reset state if re-opening
      if (!isActive) {
        setShowBuilder(false);
        setSelectedStyle('Professional');
      }
      toggleMenu(menuId);
  };

  const handleStyleClick = (style: string) => {
      setSelectedStyle(style);
      setShowBuilder(true);
  };

  const handlePredictiveSelect = (item: { l: string, f: string }) => {
      const prompt = getSmartDocPrompt(item.l, item.f, selectedStyle);
      
      // Using 'replace' mode to create a fresh document with headers/footers and page settings
      performAIAction('generate_content', prompt, { mode: 'replace' });
      closeMenu();
  };

  return (
    <>
        <button
          ref={(el) => registerTrigger(menuId, el)}
          className={`flex flex-col items-center justify-center px-1 py-1 min-w-[52px] md:min-w-[60px] h-full rounded-lg transition-all duration-200 group relative text-slate-600 hover:text-blue-700 hover:bg-slate-50 flex-shrink-0 ${isActive ? 'bg-slate-100 text-blue-700 ring-1 ring-slate-200' : ''}`}
          onClick={handleToggle}
          onMouseDown={(e) => e.preventDefault()}
          title="Smart Doc Template"
        >
          <div className="p-1 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all mb-0.5">
              <LayoutTemplate className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`} strokeWidth={1.5} />
          </div>
          <div className="flex items-center justify-center w-full px-0.5">
              <span className="text-[10px] font-medium leading-tight text-center text-slate-500 group-hover:text-blue-700">Smart Doc<br/>Template</span>
              <ChevronDown size={8} className={`ml-0.5 text-slate-400 group-hover:text-blue-600 shrink-0 ${isActive ? 'rotate-180' : ''}`} />
          </div>
        </button>

        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width="min(380px, 95vw)">
             <div 
                className="flex flex-col max-h-[70vh] md:max-h-[80vh] h-full overflow-hidden bg-white dark:bg-slate-900 shadow-2xl rounded-xl border border-slate-200 dark:border-slate-700"
                onMouseDown={(e) => e.stopPropagation()}
             >
                 {/* Style Selector */}
                 <div className="p-3 bg-white dark:bg-slate-900 shrink-0 space-y-2">
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">SELECT TONE</div>
                     <div className="grid grid-cols-2 gap-2">
                         {TONES.map((tone) => (
                             <button
                                 key={tone.id}
                                 onClick={() => handleStyleClick(tone.id)}
                                 className={`text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all border ${
                                     selectedStyle === tone.id && showBuilder
                                     ? `${tone.bg} ${tone.border} ${tone.color.replace('text-', 'text-opacity-100 text-')}`
                                     : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-300 hover:border-slate-200'
                                 }`}
                             >
                                <tone.icon size={14} className={`flex-shrink-0 ${selectedStyle === tone.id && showBuilder ? 'text-current' : tone.color}`}/> 
                                <span className={`truncate ${selectedStyle === tone.id && showBuilder ? 'text-current' : ''}`}>{tone.label}</span>
                             </button>
                         ))}
                     </div>
                 </div>

                 {/* Predictive Builder Section */}
                 <div className="flex-1 flex flex-col min-h-0 border-t border-slate-100 dark:border-slate-800">
                    {showBuilder ? (
                        <ErrorBoundary fallback={
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-red-400 gap-3 text-xs">
                                <AlertTriangle size={24} />
                                <span>Error loading template engine.</span>
                            </div>
                        }>
                            <Suspense fallback={
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 gap-3 text-xs">
                                    <Loader2 className="animate-spin text-blue-500" size={24} />
                                    <span>Loading smart templates...</span>
                                </div>
                            }>
                                <div className="bg-slate-50/50 dark:bg-slate-900/50 px-3 py-2 text-[10px] text-slate-500 dark:text-slate-400 font-semibold flex justify-between items-center border-b border-slate-100 dark:border-slate-800 backdrop-blur-sm sticky top-0 z-10">
                                    <span className="flex items-center gap-1.5">
                                        <Zap size={12} className="text-amber-500 fill-amber-500"/> 
                                        {selectedStyle} Gallery
                                    </span>
                                    <span className="font-normal opacity-70">Select to build</span>
                                </div>
                                <PredictiveBuilder onSelect={handlePredictiveSelect} selectedTone={selectedStyle} />
                            </Suspense>
                        </ErrorBoundary>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 dark:text-slate-500 text-center opacity-60">
                            <LayoutTemplate size={32} className="mb-3 text-slate-300 dark:text-slate-600" />
                            <p className="text-xs font-medium">Select a tone above to<br/>browse smart templates.</p>
                        </div>
                    )}
                 </div>
             </div>
        </MenuPortal>
    </>
  );
};
