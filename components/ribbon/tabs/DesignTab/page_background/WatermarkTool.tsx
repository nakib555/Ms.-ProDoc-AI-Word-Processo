
import React from 'react';
import { Stamp } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useDesignTab } from '../DesignTabContext';
import { DropdownRibbonButton } from '../common/DesignTools';
import { MenuPortal } from '../../../common/MenuPortal';

export const WatermarkTool: React.FC = () => {
  const { setPageConfig } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useDesignTab();
  const menuId = 'watermark';

  const setWatermark = (text: string | undefined) => {
      setPageConfig(prev => ({ ...prev, watermark: text }));
      closeMenu();
  };

  return (
    <>
        <DropdownRibbonButton 
            id={menuId} 
            icon={Stamp} 
            label="Watermark" 
        />
        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={220}>
             <div className="p-2">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Confidential</div>
                 <div className="grid grid-cols-2 gap-2 mb-2">
                     <button onClick={() => setWatermark('CONFIDENTIAL')} className="border border-slate-200 hover:border-blue-400 p-2 bg-slate-50 h-16 flex items-center justify-center relative overflow-hidden group">
                         <span className="text-[10px] -rotate-45 text-slate-300 font-bold group-hover:text-blue-300">CONFIDENTIAL</span>
                     </button>
                     <button onClick={() => setWatermark('DO NOT COPY')} className="border border-slate-200 hover:border-blue-400 p-2 bg-slate-50 h-16 flex items-center justify-center relative overflow-hidden group">
                         <span className="text-[10px] -rotate-45 text-slate-300 font-bold group-hover:text-blue-300">DO NOT COPY</span>
                     </button>
                 </div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Urgent</div>
                 <div className="grid grid-cols-2 gap-2 mb-2">
                     <button onClick={() => setWatermark('DRAFT')} className="border border-slate-200 hover:border-blue-400 p-2 bg-slate-50 h-16 flex items-center justify-center relative overflow-hidden group">
                         <span className="text-[10px] -rotate-45 text-slate-300 font-bold group-hover:text-blue-300">DRAFT</span>
                     </button>
                     <button onClick={() => setWatermark('URGENT')} className="border border-slate-200 hover:border-blue-400 p-2 bg-slate-50 h-16 flex items-center justify-center relative overflow-hidden group">
                         <span className="text-[10px] -rotate-45 text-slate-300 font-bold group-hover:text-blue-300">URGENT</span>
                     </button>
                 </div>
                 <button onClick={() => setWatermark(undefined)} className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded text-xs text-red-600 mt-1">Remove Watermark</button>
             </div>
        </MenuPortal>
    </>
  );
};
