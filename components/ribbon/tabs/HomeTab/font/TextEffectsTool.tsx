
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

  const PRESETS = [
      { name: 'Outline Blue', style: { color: 'white', WebkitTextStroke: '1px #3b82f6' } },
      { name: 'Outline Orange', style: { color: 'white', WebkitTextStroke: '1px #f97316' } },
      { name: 'Shadow', style: { textShadow: '2px 2px 2px #94a3b8' } },
      { name: 'Reflection', style: { WebkitBoxReflect: 'below -4px linear-gradient(transparent, rgba(0,0,0,0.2))' } },
      { name: 'Glow Blue', style: { textShadow: '0 0 5px #3b82f6, 0 0 10px #3b82f6' } },
      { name: 'Glow Gold', style: { textShadow: '0 0 5px #eab308, 0 0 10px #eab308' } },
      { name: 'Soft Blue', style: { color: '#3b82f6', textShadow: '1px 1px 1px #93c5fd' } },
      { name: 'Vintage', style: { color: '#78350f', textShadow: '2px 2px 0px #fbbf24' } },
      { name: '3D', style: { textShadow: '0 1px 0 #ccc, 0 2px 0 #c9c9c9, 0 3px 0 #bbb, 0 4px 0 #b9b9b9, 0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15)' } },
      { name: 'Neon', style: { color: 'white', textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff00de, 0 0 30px #ff00de, 0 0 40px #ff00de' } },
      { name: 'Inset', style: { color: '#e0e0e0', textShadow: '1px 1px 1px #fff, -1px -1px 1px #666' } },
      { name: 'Gradient', style: { background: 'linear-gradient(to right, #30CFD0 0%, #330867 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } },
      { name: 'Gradient Red', style: { background: 'linear-gradient(to right, #f43f5e, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } },
      { name: 'Gradient Blue', style: { background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } },
      { name: 'Heavy Outline', style: { color: 'transparent', WebkitTextStroke: '1px #000' } },
  ];

  const handleApply = (style: any) => {
      applyAdvancedStyle(style);
      closeMenu();
  };

  return (
    <>
       <div className="w-[1px] h-4 bg-slate-200 mx-1" />
       <DropdownToolBtn 
          id={menuId}
          icon={Type}
          title="Text Effects & Typography"
          className="text-blue-500 shadow-sm border border-transparent hover:border-slate-300"
       />
       <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={220}>
          <div className="p-2">
              <div className="grid grid-cols-3 gap-2 mb-2">
                  {PRESETS.map((effect, i) => (
                      <button 
                          key={i}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleApply(effect.style)}
                          className="h-10 border border-slate-200 rounded hover:bg-slate-50 hover:border-blue-300 flex items-center justify-center text-xl font-bold overflow-hidden"
                          style={effect.style}
                          title={effect.name}
                      >
                          A
                      </button>
                  ))}
              </div>
              <div className="border-t border-slate-100 pt-1 space-y-0.5">
                  <button className="w-full text-left text-[11px] px-2 py-1.5 hover:bg-slate-100 rounded flex items-center justify-between text-slate-700 group">
                      <span>Outline</span> <span className="text-slate-400 group-hover:text-slate-600">›</span>
                  </button>
                  <button className="w-full text-left text-[11px] px-2 py-1.5 hover:bg-slate-100 rounded flex items-center justify-between text-slate-700 group">
                      <span>Shadow</span> <span className="text-slate-400 group-hover:text-slate-600">›</span>
                  </button>
                  <button className="w-full text-left text-[11px] px-2 py-1.5 hover:bg-slate-100 rounded flex items-center justify-between text-slate-700 group">
                      <span>Reflection</span> <span className="text-slate-400 group-hover:text-slate-600">›</span>
                  </button>
                  <button className="w-full text-left text-[11px] px-2 py-1.5 hover:bg-slate-100 rounded flex items-center justify-between text-slate-700 group">
                      <span>Glow</span> <span className="text-slate-400 group-hover:text-slate-600">›</span>
                  </button>
                  
                  <button 
                    className="w-full text-left text-[10px] text-slate-500 hover:bg-red-50 hover:text-red-600 p-1.5 rounded mt-1"
                    onClick={() => { 
                        applyAdvancedStyle({ 
                            textShadow: 'none', 
                            WebkitTextStroke: '0', 
                            WebkitBackgroundClip: 'border-box',
                            WebkitTextFillColor: 'currentcolor',
                            background: 'none'
                        }); 
                        closeMenu(); 
                    }}
                  >
                      Clear Text Effects
                  </button>
              </div>
          </div>
       </MenuPortal>
    </>
  );
};
