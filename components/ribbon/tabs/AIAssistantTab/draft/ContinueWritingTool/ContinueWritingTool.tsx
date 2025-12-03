
import React, { Suspense, useTransition } from 'react';
import { PenTool, Sparkles, FileText, Feather, Activity, BookOpen, Loader2, ChevronDown } from 'lucide-react';
import { useAIAssistantTab } from '../../AIAssistantTabContext';
import { useAI } from '../../../../../../hooks/useAI';
import { MenuPortal } from '../../../../common/MenuPortal';

// Lazy load PredictiveBuilder
const PredictiveBuilder = React.lazy(() => 
  import('./PredictiveBuilder/PredictiveBuilder')
    .then(m => ({ default: m.PredictiveBuilder }))
);

export const ContinueWritingTool: React.FC = () => {
  const { performAIAction } = useAI();
  const { activeMenu, menuPos, closeMenu, toggleMenu, registerTrigger } = useAIAssistantTab();
  const [isPending, startTransition] = useTransition();
  
  const menuId = 'continue_writing_options';
  const isActive = activeMenu === menuId;

  const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      startTransition(() => {
          toggleMenu(menuId);
      });
  };

  const handleContinue = (instruction?: string) => {
      performAIAction('continue_writing', instruction);
      closeMenu();
  };

  const handlePredictiveSelect = (item: { l: string, f: string }) => {
      const instruction = `Context: ${item.l}. Analyze the document structure. Predict and generate the next logical section using the flow: "${item.f}". Do not repeat existing sections.`;
      handleContinue(instruction);
  };

  return (
    <>
        <button
          ref={(el) => registerTrigger(menuId, el)}
          className={`flex flex-col items-center justify-center px-1 py-1 min-w-[52px] md:min-w-[60px] h-full rounded-lg transition-all duration-200 group relative text-slate-600 hover:text-blue-700 hover:bg-slate-50 flex-shrink-0 ${isActive ? 'bg-slate-100 text-blue-700 ring-1 ring-slate-200' : ''}`}
          onClick={handleToggle}
          onMouseDown={(e) => e.preventDefault()}
          title="Continue Writing"
        >
          <div className="p-1 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all mb-0.5">
              {isPending ? (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" /> 
              ) : (
                  <PenTool className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`} strokeWidth={1.5} />
              )}
          </div>
          <div className="flex items-center justify-center w-full px-0.5">
              <span className="text-[10px] font-medium leading-tight text-center text-slate-500 group-hover:text-blue-700">Continue Writing</span>
              <ChevronDown size={8} className={`ml-0.5 text-slate-400 group-hover:text-blue-600 shrink-0 ${isActive ? 'rotate-180' : ''}`} />
          </div>
        </button>

        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={340}>
             <div 
                className="flex flex-col max-h-[70vh] md:max-h-[80vh] h-full overflow-hidden"
                onMouseDown={(e) => e.stopPropagation()}
             >
                 {/* Fixed Header Options */}
                 <div className="p-2 space-y-2 border-b border-slate-100 bg-white z-10 shrink-0">
                     <button 
                        onClick={() => handleContinue("Smart continuation. Predict the next logical part based on context.")} 
                        className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 rounded-lg text-sm font-semibold text-indigo-700 flex items-center gap-2 group transition-colors shadow-sm border border-indigo-100"
                     >
                        <div className="p-1.5 bg-indigo-100 rounded-md text-indigo-600 group-hover:bg-white group-hover:shadow-sm">
                            <Sparkles size={16} className="fill-indigo-200" />
                        </div>
                        <div>
                            <div className="leading-none">Smart Continuation</div>
                            <div className="text-[10px] font-normal text-indigo-500/80 mt-1">Auto-detect next logical step</div>
                        </div>
                     </button>

                     <div className="grid grid-cols-2 gap-1">
                         <button onClick={() => handleContinue("Style: Formal Academic.")} className="text-left px-2 py-1.5 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-1.5">
                            <FileText size={12} className="text-slate-400"/> Formal
                         </button>
                         <button onClick={() => handleContinue("Style: Creative.")} className="text-left px-2 py-1.5 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-1.5">
                            <Feather size={12} className="text-pink-400"/> Creative
                         </button>
                         <button onClick={() => handleContinue("Style: Technical.")} className="text-left px-2 py-1.5 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-1.5">
                            <Activity size={12} className="text-blue-400"/> Technical
                         </button>
                         <button onClick={() => handleContinue("Style: Simple.")} className="text-left px-2 py-1.5 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 flex items-center gap-1.5">
                            <BookOpen size={12} className="text-green-400"/> Simple
                         </button>
                     </div>
                 </div>

                 {/* Predictive Builder Section with Suspense */}
                 <Suspense fallback={
                    <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-xs">Loading templates...</span>
                    </div>
                 }>
                    <PredictiveBuilder onSelect={handlePredictiveSelect} />
                 </Suspense>
             </div>
        </MenuPortal>
    </>
  );
};
