
import React from 'react';
import { LayoutTemplate } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useDesignTab } from '../DesignTabContext';
import { DropdownRibbonButton } from '../common/DesignTools';
import { MenuPortal } from '../../../common/MenuPortal';

export const ThemesTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useDesignTab();
  const menuId = 'themes';

  const applyTheme = (fontHead: string, fontBody: string) => {
      executeCommand('fontName', fontBody);
      alert(`Applied Theme: ${fontHead} / ${fontBody}`);
      closeMenu();
  };

  return (
    <>
        <DropdownRibbonButton 
            id={menuId} 
            icon={LayoutTemplate} 
            label="Themes" 
        />
        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={200}>
            <div className="p-2 grid grid-cols-1 gap-1 max-h-[60vh] overflow-y-auto">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Office</div>
                <button className="flex items-center gap-3 w-full p-2 hover:bg-slate-100 rounded text-left" onClick={() => applyTheme('Calibri', 'Calibri')}>
                    <div className="w-8 h-8 bg-blue-600 rounded shadow-sm"></div>
                    <div><div className="text-xs font-semibold text-slate-700">Office</div><div className="text-[10px] text-slate-500">Calibri / Calibri</div></div>
                </button>
                <button className="flex items-center gap-3 w-full p-2 hover:bg-slate-100 rounded text-left" onClick={() => applyTheme('Arial', 'Arial')}>
                    <div className="w-8 h-8 bg-emerald-600 rounded shadow-sm"></div>
                    <div><div className="text-xs font-semibold text-slate-700">Facet</div><div className="text-[10px] text-slate-500">Arial / Arial</div></div>
                </button>
                <button className="flex items-center gap-3 w-full p-2 hover:bg-slate-100 rounded text-left" onClick={() => applyTheme('Georgia', 'Georgia')}>
                    <div className="w-8 h-8 bg-purple-600 rounded shadow-sm"></div>
                    <div><div className="text-xs font-semibold text-slate-700">Integral</div><div className="text-[10px] text-slate-500">Georgia / Georgia</div></div>
                </button>
                
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 mt-2">Custom</div>
                <button className="flex items-center gap-3 w-full p-2 hover:bg-slate-100 rounded text-left" onClick={() => applyTheme('Verdana', 'Verdana')}>
                    <div className="w-8 h-8 bg-slate-500 rounded shadow-sm"></div>
                    <div><div className="text-xs font-semibold text-slate-700">Simple</div><div className="text-[10px] text-slate-500">Verdana / Verdana</div></div>
                </button>
                <button className="flex items-center gap-3 w-full p-2 hover:bg-slate-100 rounded text-left" onClick={() => applyTheme('Trebuchet MS', 'Trebuchet MS')}>
                    <div className="w-8 h-8 bg-teal-600 rounded shadow-sm"></div>
                    <div><div className="text-xs font-semibold text-slate-700">Distinct</div><div className="text-[10px] text-slate-500">Trebuchet / Trebuchet</div></div>
                </button>
                <button className="flex items-center gap-3 w-full p-2 hover:bg-slate-100 rounded text-left" onClick={() => applyTheme('Garamond', 'Garamond')}>
                    <div className="w-8 h-8 bg-amber-800 rounded shadow-sm"></div>
                    <div><div className="text-xs font-semibold text-slate-700">Traditional</div><div className="text-[10px] text-slate-500">Garamond / Garamond</div></div>
                </button>
                <button className="flex items-center gap-3 w-full p-2 hover:bg-slate-100 rounded text-left" onClick={() => applyTheme('Arial Black', 'Arial')}>
                    <div className="w-8 h-8 bg-gray-900 rounded shadow-sm"></div>
                    <div><div className="text-xs font-semibold text-slate-700">Strong</div><div className="text-[10px] text-slate-500">Arial Black / Arial</div></div>
                </button>
            </div>
        </MenuPortal>
    </>
  );
};
