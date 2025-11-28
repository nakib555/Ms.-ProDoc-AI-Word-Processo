
import React, { useState, Suspense } from 'react';
import { LayoutTemplate, Columns, ArrowLeftRight, MoveVertical, ArrowRightLeft, Monitor, Settings2 } from 'lucide-react';
import { useEditor } from '../../../../../../contexts/EditorContext';
import { useLayoutTab } from '../../LayoutTabContext';
import { DropdownButton } from '../../common/LayoutTools';
import { MenuPortal } from '../../../../common/MenuPortal';
import { MARGIN_PRESETS } from '../../../../../../constants';
import { MarginPreset, PageConfig } from '../../../../../../types';

const PageSetupDialog = React.lazy(() => import('./CustomMargin/PageSetupDialog').then(m => ({ default: m.PageSetupDialog })));

export const MarginsTool: React.FC = () => {
  const { setPageConfig, pageConfig } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useLayoutTab();
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const menuId = 'margins';

  const handleMarginChange = (preset: MarginPreset) => {
      if (preset !== 'custom') {
          const isMirrored = preset === 'mirrored';
          setPageConfig(prev => ({ 
              ...prev, 
              marginPreset: preset,
              margins: MARGIN_PRESETS[preset as string],
              mirrorMargins: isMirrored
          }));
      }
      closeMenu();
  };

  const openCustomDialog = () => {
      closeMenu();
      setShowCustomDialog(true);
  };

  const handleCustomSave = (newConfig: PageConfig) => {
      setPageConfig(newConfig);
      setShowCustomDialog(false);
  };

  const marginOptions = [
    { id: 'normal', label: 'Normal', desc: 'Top 1" Bottom 1" Left 1" Right 1"', icon: LayoutTemplate },
    { id: 'narrow', label: 'Narrow', desc: 'Top 0.5" Bottom 0.5" Left 0.5" Right 0.5"', icon: Columns },
    { id: 'moderate', label: 'Moderate', desc: 'Top 1" Bottom 1" Left 0.75" Right 0.75"', icon: MoveVertical },
    { id: 'wide', label: 'Wide', desc: 'Top 1" Bottom 1" Left 2" Right 2"', icon: ArrowLeftRight },
    { id: 'mirrored', label: 'Mirrored', desc: 'Top 1" Bottom 1" Inside 1.25" Outside 1"', icon: ArrowRightLeft },
    { id: 'office2003', label: 'Office 2003 Default', desc: 'Top 1" Bottom 1" Left 1.25" Right 1.25"', icon: Monitor },
  ];

  return (
    <>
         <DropdownButton 
             id={menuId} 
             icon={LayoutTemplate} 
             label="Margins" 
         />
         <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={280}>
             <div className="p-1 space-y-0.5 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                 {marginOptions.map((option) => (
                     <button 
                        key={option.id}
                        onClick={() => handleMarginChange(option.id as MarginPreset)}
                        onMouseDown={(e) => e.preventDefault()}
                        className={`w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md flex items-center gap-3 group transition-colors ${pageConfig.marginPreset === option.id ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'text-slate-700'}`}
                     >
                         <option.icon size={18} className={`flex-shrink-0 ${pageConfig.marginPreset === option.id ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-600'}`} strokeWidth={1.5} />
                         <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">{option.label}</div>
                            <div className={`text-[10px] truncate ${pageConfig.marginPreset === option.id ? 'text-blue-400' : 'text-slate-400'}`}>{option.desc}</div>
                         </div>
                         {pageConfig.marginPreset === option.id && (
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-2 shrink-0" />
                         )}
                     </button>
                 ))}
                 
                 <div className="border-t border-slate-100 my-1"></div>
                 
                 <button 
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 text-xs font-medium text-slate-700 rounded-md flex items-center gap-3 group transition-colors" 
                    onClick={openCustomDialog}
                    onMouseDown={(e) => e.preventDefault()}
                 >
                    <Settings2 size={18} className="text-slate-400 group-hover:text-slate-600" strokeWidth={1.5} />
                    <span>Custom Margins...</span>
                 </button>
             </div>
         </MenuPortal>

         {showCustomDialog && (
             <Suspense fallback={null}>
                <PageSetupDialog 
                    isOpen={showCustomDialog}
                    onClose={() => setShowCustomDialog(false)}
                    config={pageConfig}
                    onSave={handleCustomSave}
                />
             </Suspense>
         )}
    </>
  );
};
