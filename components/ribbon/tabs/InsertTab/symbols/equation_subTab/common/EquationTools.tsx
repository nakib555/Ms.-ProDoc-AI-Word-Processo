
import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useEquationTab } from '../EquationTabContext';
import { MenuPortal } from '../../../../../common/MenuPortal';
import { useEditor } from '../../../../../../../contexts/EditorContext';
import { insertMathStructure } from './mathUtils';

export const StructureButton: React.FC<{
  icon: any;
  label: string;
  onClick: () => void;
  className?: string;
  hasArrow?: boolean;
}> = ({ icon: Icon, label, onClick, className, hasArrow }) => (
  <button
    className={`flex flex-col items-center justify-center px-1 py-1 min-w-[56px] h-full rounded-lg transition-all duration-200 group relative text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex-shrink-0 ${className || ''}`}
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    title={label}
  >
    <div className="p-1.5 rounded-md group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:shadow-sm transition-all mb-0.5 bg-transparent">
        <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" strokeWidth={1.5} />
    </div>
    <div className="flex items-center justify-center w-full px-0.5">
        <span className="text-[10px] font-medium leading-tight text-center text-slate-500 dark:text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400 truncate w-full">{label}</span>
        {hasArrow && <ChevronDown size={8} className="ml-0.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0" />}
    </div>
  </button>
);

const SymbolBtn: React.FC<{ symbol: string, onClick: () => void }> = ({ symbol, onClick }) => (
    <button
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()}
        className="h-9 w-9 flex items-center justify-center text-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all font-serif select-none"
        title={symbol}
    >
        {symbol}
    </button>
);

const TabButton: React.FC<{ label: string, active: boolean, onClick: () => void, className?: string }> = ({ label, active, onClick, className = '' }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`px-3 py-1.5 text-[11px] font-bold tracking-wide transition-all whitespace-nowrap rounded-lg flex-shrink-0 outline-none select-none border ${
            active 
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border-slate-200 dark:border-slate-600 ring-1 ring-black/[0.02]' 
            : 'text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200'
        } ${className}`}
    >
        {label}
    </button>
);

const HorizontalScrollContainer: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
    const ref = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const el = ref.current;
        if (el) {
            const onWheel = (e: WheelEvent) => {
                if (e.deltaY === 0) return;
                if (el.scrollWidth > el.clientWidth) {
                    e.preventDefault();
                    el.scrollLeft += e.deltaY;
                }
            };
            el.addEventListener('wheel', onWheel, { passive: false });
            return () => el.removeEventListener('wheel', onWheel);
        }
    }, []);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
};

export const SymbolCategoryDropdown: React.FC<{ category: string, icon: any, symbols: string[] }> = ({ category, icon: Icon, symbols }) => {
    const { executeCommand } = useEditor();
    const { activeMenu, toggleMenu, registerTrigger, closeMenu, menuPos } = useEquationTab();
    
    const [greekTab, setGreekTab] = useState<'Lowercase' | 'Uppercase'>('Lowercase');
    const [scriptTab, setScriptTab] = useState<'Scripts' | 'Frakturs' | 'Double-Struck'>('Scripts');
    const [opTab, setOpTab] = useState<'Binary' | 'Relational' | 'N-ary' | 'Adv. Binary' | 'Adv. Relational'>('Binary');

    const menuId = `sym-${category}`;
    const isOpen = activeMenu === menuId;
    const isGreek = category === 'Greek Letters';
    const isScripts = category === 'Scripts';
    const isOperators = category === 'Operators';

    const getMenuWidth = () => {
        if (isOperators || isScripts || isGreek) return 'min(460px, 95vw)';
        return 'min(320px, 95vw)';
    };

    return (
        <>
            <button
                ref={(el) => registerTrigger(menuId, el)}
                onClick={(e) => { e.stopPropagation(); toggleMenu(menuId); }}
                className={`flex items-center gap-2 px-3 py-1.5 text-[11px] rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent transition-all w-full text-left group ${isOpen ? 'bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}
                title={category}
                onMouseDown={(e) => e.preventDefault()}
            >
                <Icon size={14} className={`shrink-0 ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}/>
                <span className="whitespace-nowrap font-medium truncate flex-1">{category}</span>
                <ChevronDown size={10} className={`shrink-0 transition-transform text-slate-400 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
            </button>

            <MenuPortal 
                id={menuId}
                activeMenu={activeMenu}
                menuPos={menuPos}
                closeMenu={closeMenu}
                width={getMenuWidth()}
            >
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    {!isGreek && !isScripts && !isOperators && (
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1 flex justify-between items-center">
                            {category}
                            <span className="text-[9px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">{symbols.length}</span>
                        </div>
                    )}
                    
                    {isOperators ? (
                        <div className="flex flex-col h-full max-h-[400px]">
                            <HorizontalScrollContainer className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg overflow-x-auto no-scrollbar mb-2 gap-1">
                                {['Binary', 'Relational', 'N-ary', 'Adv. Binary', 'Adv. Relational'].map(tab => (
                                    <TabButton 
                                        key={tab} 
                                        label={tab} 
                                        active={opTab === tab} 
                                        onClick={() => setOpTab(tab as any)} 
                                        className="grow"
                                    />
                                ))}
                            </HorizontalScrollContainer>
                            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600 max-h-[250px] p-1">
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(2.25rem,1fr))] gap-1">
                                    {opTab === 'Binary' && symbols.slice(0, 18).map((s, i) => <SymbolBtn key={i} symbol={s} onClick={() => { executeCommand('insertText', s); closeMenu(); }} />)}
                                    {opTab === 'Relational' && symbols.slice(18, 61).map((s, i) => <SymbolBtn key={i} symbol={s} onClick={() => { executeCommand('insertText', s); closeMenu(); }} />)}
                                    {opTab === 'N-ary' && symbols.slice(61, 82).map((s, i) => <SymbolBtn key={i} symbol={s} onClick={() => { executeCommand('insertText', s); closeMenu(); }} />)}
                                    {opTab === 'Adv. Binary' && symbols.slice(82, 114).map((s, i) => <SymbolBtn key={i} symbol={s} onClick={() => { executeCommand('insertText', s); closeMenu(); }} />)}
                                    {opTab === 'Adv. Relational' && symbols.slice(114).map((s, i) => <SymbolBtn key={i} symbol={s} onClick={() => { executeCommand('insertText', s); closeMenu(); }} />)}
                                </div>
                            </div>
                        </div>
                    ) : isGreek ? (
                        <div className="flex flex-col h-full max-h-[400px]">
                            <HorizontalScrollContainer className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg overflow-x-auto no-scrollbar mb-2 gap-1">
                                <TabButton label="Lowercase" active={greekTab === 'Lowercase'} onClick={() => setGreekTab('Lowercase')} className="flex-1 min-w-[80px]" />
                                <TabButton label="Uppercase" active={greekTab === 'Uppercase'} onClick={() => setGreekTab('Uppercase')} className="flex-1 min-w-[80px]" />
                            </HorizontalScrollContainer>
                            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600 max-h-[250px] p-1">
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(2.25rem,1fr))] gap-1">
                                    {(greekTab === 'Lowercase' ? symbols.slice(0, 30) : symbols.slice(30)).map((s, i) => (
                                        <SymbolBtn 
                                            key={i} 
                                            symbol={s} 
                                            onClick={() => { executeCommand('insertText', s); closeMenu(); }} 
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : isScripts ? (
                        <div className="flex flex-col h-full max-h-[400px]">
                            <HorizontalScrollContainer className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg overflow-x-auto no-scrollbar mb-2 gap-1">
                                <TabButton label="Scripts" active={scriptTab === 'Scripts'} onClick={() => setScriptTab('Scripts')} className="flex-1 min-w-[70px]" />
                                <TabButton label="Frakturs" active={scriptTab === 'Frakturs'} onClick={() => setScriptTab('Frakturs')} className="flex-1 min-w-[70px]" />
                                <TabButton label="Double-Struck" active={scriptTab === 'Double-Struck'} onClick={() => setScriptTab('Double-Struck')} className="flex-1 min-w-[90px]" />
                            </HorizontalScrollContainer>
                            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600 max-h-[250px] p-1">
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(2.25rem,1fr))] gap-1">
                                    {scriptTab === 'Scripts' && symbols.slice(0, 52).map((s, i) => <SymbolBtn key={i} symbol={s} onClick={() => { executeCommand('insertText', s); closeMenu(); }} />)}
                                    {scriptTab === 'Frakturs' && symbols.slice(52, 104).map((s, i) => <SymbolBtn key={i} symbol={s} onClick={() => { executeCommand('insertText', s); closeMenu(); }} />)}
                                    {scriptTab === 'Double-Struck' && symbols.slice(104, 156).map((s, i) => <SymbolBtn key={i} symbol={s} onClick={() => { executeCommand('insertText', s); closeMenu(); }} />)}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600 max-h-[250px] p-1">
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(2.25rem,1fr))] gap-1">
                                {symbols.map((s, i) => (
                                    <SymbolBtn key={i} symbol={s} onClick={() => { executeCommand('insertText', s); closeMenu(); }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </MenuPortal>
        </>
    );
};

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

            <MenuPortal
                id={id}
                activeMenu={activeMenu}
                menuPos={menuPos}
                closeMenu={closeMenu}
                width={width}
            >
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden flex flex-col h-full max-h-[500px]">
                    {sections.length > 1 && (
                        <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-2 shrink-0">
                            <HorizontalScrollContainer className="flex overflow-x-auto no-scrollbar gap-1.5">
                                {sections.map((section, i) => (
                                    <TabButton 
                                        key={i}
                                        label={section.title || `Set ${i + 1}`}
                                        active={activeSectionIndex === i}
                                        onClick={() => setActiveSectionIndex(i)}
                                        className="flex-1"
                                    />
                                ))}
                            </HorizontalScrollContainer>
                        </div>
                    )}

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
                                            <button 
                                                key={j}
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    insertMathStructure(item.insertValue); 
                                                    closeMenu(); 
                                                }}
                                                className="
                                                    group relative flex flex-col items-center justify-center 
                                                    aspect-[1.4/1] rounded-xl transition-all duration-200 ease-out
                                                    bg-white dark:bg-slate-800 
                                                    border border-slate-200 dark:border-slate-700
                                                    hover:border-blue-500 hover:ring-1 hover:ring-blue-500
                                                    hover:shadow-md
                                                    focus:outline-none focus:ring-2 focus:ring-blue-500
                                                    overflow-hidden
                                                "
                                                title={item.label}
                                            >
                                                <div className="w-full h-full flex items-center justify-center p-2 text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                                                    <math-field 
                                                        read-only
                                                        style={{
                                                            border:'none', 
                                                            background:'transparent', 
                                                            pointerEvents:'none', 
                                                            fontSize:'1.2em', 
                                                            width: '100%', 
                                                            textAlign: 'center',
                                                            color: 'currentColor'
                                                        }}
                                                    >
                                                        {item.latex}
                                                    </math-field>
                                                </div>
                                                
                                                {item.label && (
                                                    <div className="absolute bottom-0 left-0 right-0 py-1 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-slate-800 dark:via-slate-800/90 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[90%] px-1">{item.label}</span>
                                                    </div>
                                                )}
                                            </button>
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
