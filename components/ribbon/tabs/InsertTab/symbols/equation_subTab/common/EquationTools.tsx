import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useEquationTab } from '../EquationTabContext';
import { MenuPortal } from '../../../../../common/MenuPortal';
import { insertMathStructure } from './mathUtils';

export interface StructureOption {
    label?: string;
    latex: string;
    insertValue: string;
}

export interface StructureSection {
    title?: string;
    items: StructureOption[];
    cols?: number; 
}

export const StructureDropdown: React.FC<{
    id: string;
    icon: any;
    label: string;
    sections: StructureSection[];
    width?: string | number;
}> = ({ id, icon: Icon, label, sections, width = 'min(480px, 96vw)' }) => {
    const { activeMenu, toggleMenu, closeMenu, registerTrigger, menuPos } = useEquationTab();
    const isOpen = activeMenu === id;
    const [activeSectionIndex, setActiveSectionIndex] = useState(0);

    return (
        <>
            {/* Trigger Button */}
            <button
                ref={(el) => registerTrigger(id, el)}
                onClick={(e) => { e.stopPropagation(); toggleMenu(id); }}
                onMouseDown={(e) => e.preventDefault()}
                className={`flex flex-col items-center justify-center px-1 py-1 min-w-[56px] h-full rounded-lg transition-all duration-200 group relative text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex-shrink-0 ${isOpen ? 'bg-slate-100 dark:bg-slate-700 text-blue-700 dark:text-blue-400' : ''}`}
                title={label}
            >
                <div className="p-1.5 rounded-md group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:shadow-sm transition-all mb-0.5 bg-transparent">
                    <Icon className={`w-5 h-5 transition-colors ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} strokeWidth={1.5} />
                </div>
                <div className="flex items-center justify-center w-full px-0.5">
                    <span className="text-[10px] font-medium leading-tight text-center text-slate-500 dark:text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400 truncate w-full">{label}</span>
                    <ChevronDown size={8} className={`ml-0.5 transition-transform ${isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'} shrink-0`} />
                </div>
            </button>

            {/* Dropdown Menu */}
            <MenuPortal
                id={id}
                activeMenu={activeMenu}
                menuPos={menuPos}
                closeMenu={closeMenu}
                width={width}
            >
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden flex flex-col h-full max-h-[500px]">
                    
                    {/* Tabs for multiple sections */}
                    {sections.length > 1 && (
                        <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-2 shrink-0">
                            <div className="flex overflow-x-auto no-scrollbar gap-1.5">
                                {sections.map((section, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => setActiveSectionIndex(i)}
                                        className={`px-3 py-1.5 text-[11px] font-bold tracking-wide transition-all whitespace-nowrap rounded-lg flex-shrink-0 outline-none select-none border ${
                                            activeSectionIndex === i 
                                            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border-slate-200 dark:border-slate-600 ring-1 ring-black/[0.02]' 
                                            : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200'
                                        } flex-1`}
                                    >
                                        {section.title || `Set ${i + 1}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section Content */}
                    <div className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 flex-1 bg-white dark:bg-slate-900">
                        {(() => {
                            const section = sections[activeSectionIndex];
                            return (
                                <div>
                                    {sections.length === 1 && section.title && (
                                        <div className="px-1 mb-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{section.title}</span>
                                        </div>
                                    )}
                                    <div 
                                        className="grid gap-2 p-2" 
                                        style={{ 
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))' 
                                        }}
                                    >
                                        {section.items.map((item, j) => (
                                            <math-field
                                                key={j}
                                                read-only
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    insertMathStructure(item.insertValue);
                                                    closeMenu();
                                                }}
                                                class="group relative flex items-center justify-center 
                                                       aspect-[1.4/1] rounded-xl transition-all duration-200 ease-out
                                                       bg-white dark:bg-slate-800 
                                                       border border-slate-200 dark:border-slate-700
                                                       hover:border-blue-500 hover:ring-1 hover:ring-blue-500
                                                       hover:shadow-md
                                                       focus:outline-none focus:ring-2 focus:ring-blue-500
                                                       overflow-hidden"
                                                style={{
                                                    border: 'none !important',
                                                    background: 'transparent !important',
                                                    pointerEvents: 'auto !important',
                                                    fontSize: '1.2em !important',
                                                    width: '100% !important',
                                                    textAlign: 'center !important',
                                                    color: 'currentColor !important',
                                                    cursor: 'pointer !important'
                                                }}
                                                title={item.label || item.latex}
                                            >
                                                {item.latex}
                                                {item.label && (
                                                    <div className="absolute bottom-0 left-0 right-0 py-1 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-slate-800 dark:via-slate-800/90 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[90%] px-1">{item.label}</span>
                                                    </div>
                                                )}
                                            </math-field>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </MenuPortal>
        </>
    );
};
