
import React from 'react';
import { PenTool, Sparkles, FileText, Feather, Activity, BookOpen } from 'lucide-react';
import { DropdownRibbonButton } from '../../common/AITools';
import { useAIAssistantTab } from '../../AIAssistantTabContext';
import { useAI } from '../../../../../../hooks/useAI';
import { MenuPortal } from '../../../../common/MenuPortal';
import { PredictiveBuilder } from './PredictiveBuilder/PredictiveBuilder';

export const ContinueWritingTool: React.FC = () => {
  const { performAIAction } = useAI();
  const { activeMenu, menuPos, closeMenu } = useAIAssistantTab();
  
  const menuId = 'continue_writing_options';

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
        <DropdownRibbonButton 
           id={menuId}
           icon={PenTool} 
           label="Continue Writing" 
           hasArrow
        />

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

                 {/* Predictive Builder Section */}
                 <PredictiveBuilder onSelect={handlePredictiveSelect} />
             </div>
        </MenuPortal>
    </>
  );
};
