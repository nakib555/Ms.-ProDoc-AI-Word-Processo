
import React, { useState, Suspense } from 'react';
import { FileText, Mail, StickyNote, File, Files } from 'lucide-react';
import { useEditor } from '../../../../../../contexts/EditorContext';
import { useLayoutTab } from '../../LayoutTabContext';
import { DropdownButton } from '../../common/LayoutTools';
import { MenuPortal } from '../../../../common/MenuPortal';
import { PageSize, PageConfig } from '../../../../../../types';
import { PAPER_FORMATS } from '../../../../../../constants';

const PageSetupDialog = React.lazy(() => import('./MorePageSizes/PageSetupDialog').then(m => ({ default: m.PageSetupDialog })));

export const SizeTool: React.FC = () => {
  const { pageConfig, setPageConfig } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useLayoutTab();
  const [showDialog, setShowDialog] = useState(false);
  const menuId = 'size';

  const handleSizeChange = (size: PageSize) => {
      setPageConfig(prev => ({ ...prev, size }));
      closeMenu();
  };

  const handleDialogSave = (newConfig: PageConfig) => {
      setPageConfig(newConfig);
      setShowDialog(false);
  };

  const getIcon = (id: string) => {
      if (id.includes('Envelope')) return Mail;
      if (id === 'Statement' || id === 'Note') return StickyNote;
      if (id === 'A3' || id === 'Tabloid') return Files;
      if (['A4', 'A5', 'B4 (JIS)', 'B5 (JIS)'].includes(id)) return File;
      return FileText;
  };

  return (
    <>
         <DropdownButton 
             id={menuId} 
             icon={FileText} 
             label="Size" 
             iconClassName="text-cyan-600"
         />
         <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={260}>
             <div 
                className="p-1 space-y-0.5 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 overscroll-contain"
             >
                 {PAPER_FORMATS.map((item) => {
                     const Icon = getIcon(item.id);
                     return (
                         <button 
                            key={item.id} 
                            onClick={() => handleSizeChange(item.id as PageSize)}
                            onMouseDown={(e) => e.preventDefault()}
                            className={`w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md flex items-center gap-3 group transition-colors ${pageConfig.size === item.id ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'text-slate-700'}`}
                         >
                             <Icon size={18} className={`flex-shrink-0 ${pageConfig.size === item.id ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-600'}`} strokeWidth={1.5} />
                             <div className="flex-1 min-w-0">
                                 <div className="font-medium text-xs truncate">{item.label}</div>
                                 <div className={`text-[10px] ${pageConfig.size === item.id ? 'text-blue-400' : 'text-slate-400'}`}>{item.width} x {item.height}</div>
                             </div>
                             {pageConfig.size === item.id && (
                                 <div className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-2 shrink-0" />
                             )}
                         </button>
                     );
                 })}
                 <div className="border-t border-slate-100 my-1"></div>
                 <button 
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 text-xs text-slate-700 rounded-md font-medium"
                    onClick={() => { closeMenu(); setShowDialog(true); }}
                    onMouseDown={(e) => e.preventDefault()}
                 >
                    More Paper Sizes...
                 </button>
             </div>
         </MenuPortal>

         {showDialog && (
             <Suspense fallback={null}>
                <PageSetupDialog 
                    isOpen={showDialog}
                    onClose={() => setShowDialog(false)}
                    config={pageConfig}
                    onSave={handleDialogSave}
                />
             </Suspense>
         )}
    </>
  );
};
