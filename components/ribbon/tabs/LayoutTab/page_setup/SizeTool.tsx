
import React from 'react';
import { FileText } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useLayoutTab } from '../LayoutTabContext';
import { DropdownButton } from '../common/LayoutTools';
import { MenuPortal } from '../../../common/MenuPortal';
import { PageSize } from '../../../../../types';

export const SizeTool: React.FC = () => {
  const { pageConfig, setPageConfig } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useLayoutTab();
  const menuId = 'size';

  const handleSizeChange = (size: PageSize) => {
      setPageConfig(prev => ({ ...prev, size }));
      closeMenu();
  };

  const paperSizes: { size: PageSize; label: string; dims: string }[] = [
      { size: 'Letter', label: 'Letter', dims: '8.5" x 11"' },
      { size: 'Legal', label: 'Legal', dims: '8.5" x 14"' },
      { size: 'Executive', label: 'Executive', dims: '7.25" x 10.5"' },
      { size: 'A3', label: 'A3', dims: '11.69" x 16.54"' },
      { size: 'A4', label: 'A4', dims: '8.27" x 11.69"' },
      { size: 'A5', label: 'A5', dims: '5.83" x 8.27"' },
      { size: 'B4 (JIS)', label: 'B4 (JIS)', dims: '9.84" x 13.90"' },
      { size: 'B5 (JIS)', label: 'B5 (JIS)', dims: '6.93" x 9.84"' },
      { size: 'Statement', label: 'Statement', dims: '5.5" x 8.5"' },
      { size: 'Tabloid', label: 'Tabloid', dims: '11" x 17"' },
      { size: 'Note', label: 'Note', dims: '8.5" x 11"' },
      { size: 'Envelope #10', label: 'Envelope #10', dims: '4.125" x 9.5"' },
      { size: 'Envelope DL', label: 'Envelope DL', dims: '4.33" x 8.66"' }
  ];

  return (
    <>
         <DropdownButton 
             id={menuId} 
             icon={FileText} 
             label="Size" 
         />
         <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={220}>
             <div className="p-1 space-y-0.5 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                 {paperSizes.map((item) => (
                     <button 
                        key={item.size} 
                        onClick={() => handleSizeChange(item.size)} 
                        className={`w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md flex items-center justify-between text-xs font-medium group ${pageConfig.size === item.size ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'text-slate-700'}`}
                     >
                         <span>{item.label}</span>
                         <span className={`text-[9px] ml-2 ${pageConfig.size === item.size ? 'text-blue-400' : 'text-slate-400'}`}>{item.dims}</span>
                     </button>
                 ))}
                 <div className="border-t border-slate-100 my-1"></div>
                 <button 
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 text-xs text-slate-700 rounded-md"
                    onClick={() => { alert("Use Page Setup Dialog for Custom Sizes"); closeMenu(); }}
                 >
                    More Paper Sizes...
                 </button>
             </div>
         </MenuPortal>
    </>
  );
};
