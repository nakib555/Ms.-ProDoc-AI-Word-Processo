
import React, { useState, Suspense, useMemo } from 'react';
import { LayoutTemplate, Columns, ArrowLeftRight, MoveVertical, ArrowRightLeft, Monitor, Settings2 } from 'lucide-react';
import { useEditor } from '../../../../../../contexts/EditorContext';
import { useLayoutTab } from '../../LayoutTabContext';
import { DropdownButton } from '../../common/LayoutTools';
import { MenuPortal } from '../../../../common/MenuPortal';
import { MARGIN_PRESETS } from '../../../../../../constants';
import { MarginPreset, MarginValues } from '../../../../../../types';

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

  const handleCustomSave = (newConfig: any) => {
      setPageConfig(newConfig);
      setShowCustomDialog(false);
  };

  const formatLabel = (key: string) => {
      if (key === 'office2003') return 'Office 2003 Default';
      if (key === 'apa') return 'APA';
      if (key === 'mla') return 'MLA';
      if (key === 'chicago') return 'Chicago';
      
      const result = key.replace(/([A-Z])/g, " $1");
      return result.charAt(0).toUpperCase() + result.slice(1);
  };

  const marginOptions = useMemo(() => (Object.entries(MARGIN_PRESETS) as [string, MarginValues][]).map(([key, val]) => {
      let icon = LayoutTemplate;
      let colorClass = "text-slate-400";
      
      if (key === 'normal') { colorClass = "text-blue-500"; }
      if (key === 'narrow') { icon = Columns; colorClass = "text-emerald-500"; }
      if (key === 'moderate') { icon = MoveVertical; colorClass = "text-orange-500"; }
      if (key === 'wide') { icon = ArrowLeftRight; colorClass = "text-purple-500"; }
      if (key === 'mirrored') { icon = ArrowRightLeft; colorClass = "text-indigo-500"; }
      if (key === 'office2003') { icon = Monitor; colorClass = "text-sky-500"; }

      return {
        id: key,
        label: formatLabel(key),
        desc: `Top ${val.top}" Bottom ${val.bottom}" Left ${val.left}" Right ${val.right}"`,
        icon,
        colorClass
      };
  }), []);

  return (
    <>
         <DropdownButton 
             id={menuId} 
             icon={LayoutTemplate} 
             label="Margins" 
             iconClassName="text-cyan-600 dark:text-cyan-500"
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
                         <option.icon size={18} className={`flex-shrink-0 ${pageConfig.marginPreset === option.id ? 'text-blue-500' : option.colorClass}`} strokeWidth={1.5} />
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
