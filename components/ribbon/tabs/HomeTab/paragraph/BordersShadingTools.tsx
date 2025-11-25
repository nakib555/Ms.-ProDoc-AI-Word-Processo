
import React from 'react';
import { PaintBucket, LayoutGrid } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useHomeTab } from '../HomeTabContext';
import { MenuPortal } from '../../../common/MenuPortal';
import { DropdownToolBtn } from '../common/HomeTools';

export const BordersShadingTools: React.FC = () => {
  const { applyBlockStyle } = useEditor();
  const { activeMenu, toggleMenu, closeMenu, menuPos } = useHomeTab();
  const shadingId = 'shading';
  const bordersId = 'borders';

  return (
    <>
        {/* Shading */}
        <DropdownToolBtn 
            id={shadingId}
            icon={PaintBucket}
            title="Shading"
        />
        <MenuPortal id={shadingId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={176}>
            <div className="p-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Theme Colors</div>
                <div className="grid grid-cols-6 gap-1">
                    {['#ffffff', '#000000', '#e2e8f0', '#1d4ed8', '#ed8936', '#991b1b', '#fef3c7', '#dcfce7', '#dbeafe', '#f3e8ff'].map(color => (
                        <button 
                            key={color}
                            onClick={() => { applyBlockStyle({ backgroundColor: color }); closeMenu(); }}
                            onMouseDown={(e) => e.preventDefault()}
                            className="w-5 h-5 rounded border border-slate-200 hover:scale-110 transition-transform shadow-sm"
                            style={{ backgroundColor: color }}
                            title={color}
                        />
                    ))}
                </div>
                <button 
                    onClick={() => { applyBlockStyle({ backgroundColor: 'transparent' }); closeMenu(); }}
                    className="w-full mt-2 text-left text-[10px] text-slate-600 hover:bg-slate-100 p-1 rounded"
                >
                    No Color
                </button>
            </div>
        </MenuPortal>

        {/* Borders */}
        <DropdownToolBtn 
            id={bordersId}
            icon={LayoutGrid}
            title="Borders"
        />
        <MenuPortal id={bordersId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={160}>
            <div className="p-1 space-y-0.5">
                <button onClick={() => { applyBlockStyle({ borderBottom: '1px solid #cbd5e1' }); closeMenu(); }} className="w-full flex items-center px-2 py-1.5 text-left text-xs hover:bg-slate-100 rounded-md gap-2 text-slate-700">
                    <div className="w-4 h-4 border-b border-black"></div> Bottom Border
                </button>
                <button onClick={() => { applyBlockStyle({ borderTop: '1px solid #cbd5e1' }); closeMenu(); }} className="w-full flex items-center px-2 py-1.5 text-left text-xs hover:bg-slate-100 rounded-md gap-2 text-slate-700">
                    <div className="w-4 h-4 border-t border-black"></div> Top Border
                </button>
                <button onClick={() => { applyBlockStyle({ borderLeft: '1px solid #cbd5e1' }); closeMenu(); }} className="w-full flex items-center px-2 py-1.5 text-left text-xs hover:bg-slate-100 rounded-md gap-2 text-slate-700">
                    <div className="w-4 h-4 border-l border-black"></div> Left Border
                </button>
                <button onClick={() => { applyBlockStyle({ borderRight: '1px solid #cbd5e1' }); closeMenu(); }} className="w-full flex items-center px-2 py-1.5 text-left text-xs hover:bg-slate-100 rounded-md gap-2 text-slate-700">
                    <div className="w-4 h-4 border-r border-black"></div> Right Border
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button onClick={() => { applyBlockStyle({ border: 'none' }); closeMenu(); }} className="w-full flex items-center px-2 py-1.5 text-left text-xs hover:bg-slate-100 rounded-md gap-2 text-slate-700">
                    <div className="w-4 h-4 border border-dashed border-slate-400"></div> No Border
                </button>
                <button onClick={() => { applyBlockStyle({ border: '1px solid #cbd5e1' }); closeMenu(); }} className="w-full flex items-center px-2 py-1.5 text-left text-xs hover:bg-slate-100 rounded-md gap-2 text-slate-700">
                    <div className="w-4 h-4 border border-black"></div> All Borders
                </button>
            </div>
        </MenuPortal>
    </>
  );
};
