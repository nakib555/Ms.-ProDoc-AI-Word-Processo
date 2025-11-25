
import React from 'react';
import { Type } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useHomeTab } from '../HomeTabContext';
import { MenuPortal } from '../../../common/MenuPortal';
import { DropdownToolBtn } from '../common/HomeTools';

export const TextEffectsTool: React.FC = () => {
  const { applyAdvancedStyle } = useEditor();
  const { activeMenu, toggleMenu, closeMenu, menuPos } = useHomeTab();
  const menuId = 'text_effects';

  const TEXT_EFFECTS = [
    { name: 'Blue Glow', style: { textShadow: '0 0 5px #3b82f6', color: '#1e3a8a' } },
    { name: 'Orange Outline', style: { textShadow: '-1px -1px 0 #ea580c, 1px -1px 0 #ea580c, -1px 1px 0 #ea580c, 1px 1px 0 #ea580c', color: 'white' } },
    { name: 'Soft Shadow', style: { textShadow: '2px 2px 4px #94a3b8', color: '#334155' } },
    { name: 'Neon', style: { textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #ff00de', color: 'white' } },
  ];

  return (
    <>
       <div className="w-[1px] h-4 bg-slate-200 mx-1" />
       <DropdownToolBtn 
          id={menuId}
          icon={Type}
          title="Text Effects & Typography"
          className="text-blue-500 shadow-sm border border-transparent hover:border-slate-300"
       />
       <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={180}>
          <div className="p-2 grid grid-cols-2 gap-2">
              {TEXT_EFFECTS.map((effect, i) => (
                  <button 
                      key={i}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { applyAdvancedStyle(effect.style); closeMenu(); }}
                      className="h-10 border border-slate-200 rounded hover:bg-slate-50 flex items-center justify-center text-lg font-bold"
                      style={effect.style}
                      title={effect.name}
                  >
                      A
                  </button>
              ))}
          </div>
          <div className="px-2 pb-2">
              <button className="w-full text-left text-[10px] text-slate-500 hover:bg-slate-100 p-1 rounded">Clear Effects</button>
          </div>
       </MenuPortal>
    </>
  );
};
