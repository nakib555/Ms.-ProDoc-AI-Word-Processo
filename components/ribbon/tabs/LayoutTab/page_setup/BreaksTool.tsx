
import React from 'react';
import { Scissors, PanelTop, Columns, WrapText, MoreHorizontal, FilePlus, ArrowRight } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useLayoutTab } from '../LayoutTabContext';
import { DropdownButton } from '../common/LayoutTools';
import { MenuPortal } from '../../../common/MenuPortal';

export const BreaksTool: React.FC = () => {
  const { executeCommand, pageConfig } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useLayoutTab();
  const menuId = 'breaks';

  const insertSectionBreak = (type: 'nextPage' | 'continuous', newConfig?: any) => {
      // Create a section break marker. It holds the NEW configuration for the FOLLOWING content.
      // We start with current config, allowing overrides (e.g. landscape)
      const nextConfig = { ...pageConfig, ...newConfig };
      
      // We don't store the full config blob if not needed, but robust engine supports full override
      // Just storing changes to keep it clean if possible, but full is safer.
      const configStr = encodeURIComponent(JSON.stringify(nextConfig));
      
      const html = `<div class="prodoc-section-break" data-type="${type}" data-config="${configStr}" style="border-top: 2px dashed #94a3b8; margin: 1em 0; color: #64748b; font-size: 10px; text-align: center; user-select: none;" contenteditable="false">::: Section Break (${type === 'nextPage' ? 'Next Page' : 'Continuous'}) :::</div><p><br/></p>`;
      
      executeCommand('insertHTML', html);
      closeMenu();
  };

  return (
    <>
         <DropdownButton 
             id={menuId} 
             icon={Scissors} 
             label="Breaks" 
             iconClassName="text-blue-600 dark:text-blue-400"
         />
         <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={220}>
             <div className="p-2">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Page Breaks</div>
                 <button onClick={() => { executeCommand('pageBreak'); closeMenu(); }} className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded text-xs text-slate-700 flex items-center gap-2 mb-1 group">
                     <PanelTop size={14} className="text-slate-400 group-hover:text-blue-600"/> Page
                 </button>
                 <button className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded text-xs text-slate-700 flex items-center gap-2 mb-1 group" onClick={() => closeMenu()}>
                     <Columns size={14} className="text-slate-400 group-hover:text-blue-600"/> Column
                 </button>
                 <button className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded text-xs text-slate-700 flex items-center gap-2 group" onClick={() => closeMenu()}>
                     <WrapText size={14} className="text-slate-400 group-hover:text-blue-600"/> Text Wrapping
                 </button>
                 
                 <div className="border-t border-slate-100 my-2"></div>
                 
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Section Breaks</div>
                 <button onClick={() => insertSectionBreak('nextPage')} className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded text-xs text-slate-700 flex items-center gap-2 mb-1 group">
                     <ArrowRight size={14} className="text-slate-400 group-hover:text-orange-600"/> Next Page
                 </button>
                 <button onClick={() => insertSectionBreak('continuous')} className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded text-xs text-slate-700 flex items-center gap-2 group mb-1">
                     <MoreHorizontal size={14} className="text-slate-400 group-hover:text-orange-600"/> Continuous
                 </button>
                 <button onClick={() => insertSectionBreak('nextPage', { orientation: pageConfig.orientation === 'portrait' ? 'landscape' : 'portrait' })} className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded text-xs text-slate-700 flex items-center gap-2 group">
                     <FilePlus size={14} className="text-slate-400 group-hover:text-orange-600"/> Next Page (Flip Orientation)
                 </button>
             </div>
         </MenuPortal>
    </>
  );
};
