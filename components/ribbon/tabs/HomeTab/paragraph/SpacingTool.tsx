
import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useHomeTab } from '../HomeTabContext';
import { MenuPortal } from '../../../common/MenuPortal';
import { DropdownToolBtn } from '../common/HomeTools';

export const SpacingTool: React.FC = () => {
  const { applyBlockStyle } = useEditor();
  const { activeMenu, toggleMenu, closeMenu, menuPos } = useHomeTab();
  const menuId = 'line_spacing';

  return (
    <>
        <div className="w-[1px] h-4 bg-slate-200 mx-1" />
        <DropdownToolBtn 
            id={menuId}
            icon={ArrowUpDown}
            title="Line & Paragraph Spacing"
        />
        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={100}>
            {[1.0, 1.15, 1.5, 2.0, 2.5, 3.0].map(val => (
                <button 
                    key={val}
                    onClick={() => { applyBlockStyle({ lineHeight: val.toString() }); closeMenu(); }}
                    onMouseDown={(e) => e.preventDefault()}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-xs text-slate-700 rounded-md"
                >
                    {val}
                </button>
            ))}
        </MenuPortal>
    </>
  );
};
