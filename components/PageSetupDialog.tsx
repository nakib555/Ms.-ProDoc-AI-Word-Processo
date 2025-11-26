
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, LayoutTemplate, FileText, ChevronDown, Monitor, Check } from 'lucide-react';
import { 
  PageConfig, PageSize, PageOrientation, 
  MultiplePagesType, ApplyToType, SheetsPerBookletType
} from '../types';
import { PAGE_SIZES } from '../constants';

interface PageSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  config: PageConfig;
  onSave: (config: PageConfig) => void;
}

type Tab = 'margins' | 'paper' | 'layout';
type MarginSubTab = 'margins' | 'orientation' | 'pages' | 'apply';
type PaperSubTab = 'size' | 'source' | 'apply';
type LayoutSubTab = 'section' | 'headers' | 'page' | 'apply';

export const PageSetupDialog: React.FC<PageSetupDialogProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('margins');
  const [marginSubTab, setMarginSubTab] = useState<MarginSubTab>('margins');
  const [paperSubTab, setPaperSubTab] = useState<PaperSubTab>('size');
  const [layoutSubTab, setLayoutSubTab] = useState<LayoutSubTab>('section');
  const [localConfig, setLocalConfig] = useState<PageConfig>(config);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(JSON.parse(JSON.stringify(config)));
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleMarginInputChange = (section: keyof PageConfig['margins'], value: string) => {
    let numVal = parseFloat(value);
    if (isNaN(numVal)) numVal = 0;
    if (numVal < 0) numVal = 0;
    
    setLocalConfig(prev => ({
      ...prev,
      marginPreset: 'custom',
      margins: {
        ...prev.margins,
        [section]: numVal
      }
    }));
  };

  const handleGutterPositionChange = (position: 'left' | 'top') => {
    setLocalConfig(prev => ({
        ...prev,
        gutterPosition: position
    }));
  };

  const handleMultiplePagesChange = (type: MultiplePagesType) => {
    setLocalConfig(prev => ({
        ...prev,
        multiplePages: type,
        mirrorMargins: type === 'mirrorMargins' || type === 'bookFold'
    }));
  };

  const handleSheetsPerBookletChange = (sheets: SheetsPerBookletType) => {
      setLocalConfig(prev => ({ ...prev, sheetsPerBooklet: sheets }));
  };

  const handleApplyToChange = (applyTo: ApplyToType) => {
      setLocalConfig(prev => ({ ...prev, applyTo }));
  };

  const handleOrientationChange = (orientation: PageOrientation) => {
    if (orientation !== localConfig.orientation) {
        let currentWidth = localConfig.customWidth;
        let currentHeight = localConfig.customHeight;
        
        if (localConfig.size !== 'Custom' || !currentWidth || !currentHeight) {
             const base = PAGE_SIZES[localConfig.size as keyof typeof PAGE_SIZES] || PAGE_SIZES.Letter;
             currentWidth = base.width / 96;
             currentHeight = base.height / 96;
        }

        const newWidth = currentHeight;
        const newHeight = currentWidth;

        setLocalConfig(prev => ({
            ...prev,
            orientation,
            customWidth: newWidth,
            customHeight: newHeight,
            size: 'Custom' 
        }));
    }
  };

  const handlePaperSizeChange = (size: PageSize) => {
      let w = 0, h = 0;
      if (size !== 'Custom') {
          const base = PAGE_SIZES[size as keyof typeof PAGE_SIZES] || PAGE_SIZES.Letter;
          w = base.width / 96;
          h = base.height / 96;
      } else {
          w = localConfig.customWidth || PAGE_SIZES.Letter.width / 96;
          h = localConfig.customHeight || PAGE_SIZES.Letter.height / 96;
      }
      
      if (localConfig.orientation === 'landscape' && size !== 'Custom') {
          const temp = w; w = h; h = temp;
      }

      setLocalConfig(prev => ({
          ...prev,
          size,
          customWidth: w,
          customHeight: h
      }));
  };

  const CompactInput = ({ label, value, onChange, suffix = '"' }: any) => (
    <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 px-3 py-2 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all group shadow-sm">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">{label}</span>
        <div className="flex items-center gap-1">
            <input 
                type="number" 
                step="0.1"
                className="w-12 text-right bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none p-0"
                value={value}
                onChange={onChange}
                onFocus={(e) => e.target.select()}
                onBlur={(e) => { 
                    const val = parseFloat(e.target.value);
                    if (isNaN(val) || val < 0) onChange({target: {value: '0'}});
                }}
            />
            <span className="text-[10px] text-slate-400 font-medium">{suffix}</span>
        </div>
    </div>
  );

  const CompactSelect = ({ label, value, onChange, options, disabled = false }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    const updateCoords = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width
            });
        }
    };

    const toggleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        
        if (!isOpen) {
            updateCoords();
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('resize', updateCoords);
            window.addEventListener('scroll', updateCoords, true);
        }
        return () => {
            window.removeEventListener('resize', updateCoords);
            window.removeEventListener('scroll', updateCoords, true);
        };
    }, [isOpen]);

    return (
        <div className={`flex flex-col gap-1.5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide ml-1">{label}</span>
            <button
                ref={buttonRef}
                type="button"
                onClick={toggleOpen}
                className={`w-full flex items-center justify-between bg-white dark:bg-slate-800 border transition-all rounded-lg pl-3 pr-2 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none shadow-sm ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'}`}
            >
                <span className="truncate mr-2 text-left flex-1">{options.find((o: any) => o.value === value)?.label || value}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && createPortal(
                <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
                    <div 
                        className="fixed z-[9999] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600 animate-in fade-in zoom-in-95 duration-100 flex flex-col py-1"
                        style={{ top: coords.top, left: coords.left, width: coords.width }}
                    >
                        {options.map((opt: any) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange({ target: { value: opt.value } });
                                    setIsOpen(false);
                                }}
                                className={`text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors ${opt.value === value ? 'bg-blue-50 dark:bg-slate-700/50 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-200'}`}
                            >
                                <span className="truncate">{opt.label}</span>
                                {opt.value === value && <Check size={12} className="shrink-0 ml-2" />}
                            </button>
                        ))}
                    </div>
                </>,
                document.body
            )}
        </div>
    );
  };

  const ApplyToSection = () => (
    <div className="flex flex-col gap-4 pt-2">
        <CompactSelect 
            label="Apply to" 
            value={localConfig.applyTo || 'wholeDocument'} 
            onChange={(e: any) => handleApplyToChange(e.target.value)}
            options={[
                { value: 'wholeDocument', label: 'Whole document' },
                { value: 'thisSection', label: 'This section' },
                { value: 'thisPointForward', label: 'This point forward' },
            ]}
        />
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 leading-relaxed">
            Apply changes to the entire document or from this point onward.
        </div>
    </div>
  );

  const renderPreview = () => {
    const { orientation, multiplePages, margins, gutterPosition } = localConfig;
    const isPortrait = orientation === 'portrait';
    const isMirroredOrBookFold = ['mirrorMargins', 'bookFold'].includes(multiplePages || '');
    const hasGutter = (margins.gutter || 0) > 0;

    const baseWidth = isPortrait ? 80 : 110;
    const baseHeight = isPortrait ? 110 : 80;
    
    const marginScale = 6; 
    const previewMargins = {
      top: margins.top * marginScale,
      bottom: margins.bottom * marginScale,
      left: margins.left * marginScale,
      right: margins.right * marginScale,
      gutter: (margins.gutter || 0) * marginScale
    };

    let effectiveLeft = previewMargins.left;
    let effectiveRight = previewMargins.right;
    let effectiveTop = previewMargins.top;

    if (!isMirroredOrBookFold && hasGutter) {
        if (gutterPosition === 'left') {
            effectiveLeft += previewMargins.gutter;
        } else { 
            effectiveTop += previewMargins.gutter;
        }
    }

    const SkeletonContent = () => (
        <div className="w-full h-full flex flex-col gap-[3px] overflow-hidden opacity-60">
            <div className="w-3/4 h-[2px] bg-slate-300 rounded-full mb-[2px]"></div>
            <div className="w-full h-[1px] bg-slate-200 rounded-full"></div>
            <div className="w-full h-[1px] bg-slate-200 rounded-full"></div>
            <div className="w-5/6 h-[1px] bg-slate-200 rounded-full"></div>
            <div className="w-full h-[1px] bg-slate-200 rounded-full mt-[2px]"></div>
            <div className="w-full h-[1px] bg-slate-200 rounded-full"></div>
            <div className="w-4/5 h-[1px] bg-slate-200 rounded-full"></div>
            <div className="w-1/2 h-[1px] bg-slate-200 rounded-full mt-[2px]"></div>
        </div>
    );

    const GutterPattern = () => (
        <div 
            className="absolute bg-slate-300/30 z-10 h-full w-full"
            style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #cbd5e1 2px, #cbd5e1 3px)',
            }}
        />
    );

    const PageSheet = ({ children, style }: any) => (
        <div 
            className="bg-white relative shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12),0_2px_6px_-1px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out ring-1 ring-black/[0.03]"
            style={{
                ...style,
                borderRadius: '2px' 
            }}
        >
            {children}
        </div>
    );

    const SinglePagePreview = (
        <PageSheet style={{ width: `${baseWidth}px`, height: `${baseHeight}px` }}>
            <div 
                className="absolute border-[0.5px] border-dashed border-blue-300/60 flex flex-col justify-evenly px-[2px] py-[2px] transition-all duration-300"
                style={{
                    top: `${effectiveTop}px`,
                    bottom: `${previewMargins.bottom}px`,
                    left: `${effectiveLeft}px`,
                    right: `${effectiveRight}px`,
                    backgroundColor: 'rgba(59, 130, 246, 0.02)'
                }}
            >
                <SkeletonContent />
            </div>
            
            {hasGutter && gutterPosition === 'left' && !isMirroredOrBookFold && (
                <div className="absolute top-0 bottom-0 left-0" style={{width: `${previewMargins.gutter}px`}}>
                    <GutterPattern />
                </div>
            )}
            {hasGutter && gutterPosition === 'top' && !isMirroredOrBookFold && (
                <div className="absolute left-0 right-0 top-0" style={{height: `${previewMargins.gutter}px`}}>
                    <GutterPattern />
                </div>
            )}
        </PageSheet>
    );

    const TwoPagePreview = (
        <div className="flex items-center justify-center gap-[1px]">
            {/* Left Page */}
            <PageSheet style={{ width: `${baseWidth}px`, height: `${baseHeight}px` }}>
                <div 
                    className="absolute border-[0.5px] border-dashed border-blue-300/60 flex flex-col justify-evenly px-[2px] py-[2px]"
                    style={{
                        top: `${previewMargins.top}px`,
                        bottom: `${previewMargins.bottom}px`,
                        left: `${previewMargins.right}px`,
                        right: `${previewMargins.left + (hasGutter && gutterPosition === 'left' ? previewMargins.gutter : 0)}px`,
                        backgroundColor: 'rgba(59, 130, 246, 0.02)'
                    }}
                >
                    <SkeletonContent />
                </div>
                 {hasGutter && gutterPosition === 'left' && (
                    <div className="absolute top-0 bottom-0 right-0 border-l border-slate-300/50" style={{width: `${previewMargins.gutter}px`, right: `${previewMargins.left}px`}}>
                        <GutterPattern />
                    </div>
                )}
            </PageSheet>

            {/* Spine/Binding Effect */}
            <div className="w-[2px] h-[95%] bg-gradient-to-b from-slate-300 via-slate-400 to-slate-300 shadow-sm z-10 rounded-full"></div>

            {/* Right Page */}
            <PageSheet style={{ width: `${baseWidth}px`, height: `${baseHeight}px` }}>
                <div 
                    className="absolute border-[0.5px] border-dashed border-blue-300/60 flex flex-col justify-evenly px-[2px] py-[2px]"
                    style={{
                        top: `${previewMargins.top}px`,
                        bottom: `${previewMargins.bottom}px`,
                        left: `${previewMargins.left + (hasGutter && gutterPosition === 'left' ? previewMargins.gutter : 0)}px`,
                        right: `${previewMargins.right}px`,
                        backgroundColor: 'rgba(59, 130, 246, 0.02)'
                    }}
                >
                    <SkeletonContent />
                </div>
                 {hasGutter && gutterPosition === 'left' && (
                    <div className="absolute top-0 bottom-0 left-0 border-r border-slate-300/50" style={{width: `${previewMargins.gutter}px`, left: `${previewMargins.left}px`}}>
                        <GutterPattern />
                    </div>
                )}
            </PageSheet>
        </div>
    );

    if (['mirrorMargins', 'bookFold', 'twoPagesPerSheet'].includes(multiplePages || '')) {
        return TwoPagePreview;
    }
    return SinglePagePreview;
  };

  const renderSubTabs = (tabs: string[], active: string, setActive: any) => (
    <div className="px-5 pb-2 shrink-0">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-1 overflow-x-auto no-scrollbar">
            {tabs.map((sub) => (
                <button
                    key={sub}
                    onClick={() => setActive(sub)}
                    className={`pb-2 px-1 text-xs font-medium transition-all relative capitalize whitespace-nowrap ${active === sub ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    {sub.replace(/([A-Z])/g, ' $1').trim()}
                    {active === sub && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
                    )}
                </button>
            ))}
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-[95vw] md:w-[50vw] lg:w-[30vw] max-w-[450px] h-[50vh] max-h-[700px] rounded-2xl shadow-2xl border border-white/50 dark:border-slate-700 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 dark:bg-slate-800 rounded-md text-blue-600 dark:text-blue-400">
                    <LayoutTemplate size={16} /> 
                </div>
                Page Setup
            </h2>
            <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
            >
                <X size={18} />
            </button>
        </div>

        {/* Main Tabs */}
        <div className="px-5 pt-4 pb-2 bg-white dark:bg-slate-900 shrink-0">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {['margins', 'paper', 'layout'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as Tab)}
                        className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded-lg transition-all duration-300 ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* Beautiful Preview Section */}
            <div className="px-5 pt-2 pb-4 shrink-0 relative z-0">
                 <div className="w-full h-[20vh] min-h-[140px] rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden flex items-center justify-center shadow-inner group"
                      style={{
                          backgroundColor: '#f1f5f9',
                          backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
                          backgroundSize: '20px 20px'
                      }}
                 >
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-100/50 to-transparent pointer-events-none"></div>
                     <div className="relative z-10 transform transition-transform group-hover:scale-[1.02] duration-500 perspective-1000">
                        {renderPreview()}
                     </div>
                     <div className="absolute bottom-2 right-3 text-[10px] font-semibold text-slate-400/80 bg-white/60 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/50 shadow-sm pointer-events-none">
                        PREVIEW
                     </div>
                 </div>
            </div>

            {/* Sub-Tabs Navigation */}
            {activeTab === 'margins' && renderSubTabs(['margins', 'orientation', 'pages', 'apply'], marginSubTab, setMarginSubTab)}
            {activeTab === 'paper' && renderSubTabs(['size', 'source', 'apply'], paperSubTab, setPaperSubTab)}
            {activeTab === 'layout' && renderSubTabs(['section', 'headers', 'page', 'apply'], layoutSubTab, setLayoutSubTab)}

            {/* Scrollable Settings Area */}
            <div className="flex-1 overflow-y-auto px-5 pb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-300">
                {activeTab === 'margins' && (
                    <div className="animate-in slide-in-from-right-4 duration-300 fade-in">
                        {marginSubTab === 'margins' && (
                            <div className="flex flex-col gap-4 pt-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <CompactInput label="Top" value={localConfig.margins.top} onChange={(e: any) => handleMarginInputChange('top', e.target.value)} />
                                    <CompactInput label="Bottom" value={localConfig.margins.bottom} onChange={(e: any) => handleMarginInputChange('bottom', e.target.value)} />
                                    <CompactInput label={localConfig.multiplePages === 'mirrorMargins' || localConfig.multiplePages === 'bookFold' ? 'Inside' : 'Left'} value={localConfig.margins.left} onChange={(e: any) => handleMarginInputChange('left', e.target.value)} />
                                    <CompactInput label={localConfig.multiplePages === 'mirrorMargins' || localConfig.multiplePages === 'bookFold' ? 'Outside' : 'Right'} value={localConfig.margins.right} onChange={(e: any) => handleMarginInputChange('right', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <CompactInput label="Gutter" value={localConfig.margins.gutter} onChange={(e: any) => handleMarginInputChange('gutter', e.target.value)} />
                                    <CompactSelect
                                        label="Position"
                                        value={localConfig.gutterPosition}
                                        onChange={(e: any) => handleGutterPositionChange(e.target.value)}
                                        options={[
                                            { value: 'left', label: 'Left' },
                                            { value: 'top', label: 'Top' },
                                        ]}
                                    />
                                </div>
                            </div>
                        )}

                        {marginSubTab === 'orientation' && (
                            <div className="flex flex-col gap-4 pt-2">
                                <div className="flex gap-4">
                                     <button 
                                        onClick={() => handleOrientationChange('portrait')}
                                        className={`flex-1 flex flex-col items-center justify-center py-6 rounded-xl border transition-all duration-200 group ${localConfig.orientation === 'portrait' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50'}`}
                                     >
                                        <div className={`mb-3 p-3 rounded-full ${localConfig.orientation === 'portrait' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                                            <FileText size={24} />
                                        </div>
                                        <span className="text-sm font-bold">Portrait</span>
                                     </button>
                                     <button 
                                        onClick={() => handleOrientationChange('landscape')}
                                        className={`flex-1 flex flex-col items-center justify-center py-6 rounded-xl border transition-all duration-200 group ${localConfig.orientation === 'landscape' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50'}`}
                                     >
                                        <div className={`mb-3 p-3 rounded-full ${localConfig.orientation === 'landscape' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                                            <FileText size={24} className="rotate-90"/>
                                        </div>
                                        <span className="text-sm font-bold">Landscape</span>
                                     </button>
                                </div>
                            </div>
                        )}

                        {marginSubTab === 'pages' && (
                            <div className="flex flex-col gap-4 pt-2">
                                <div className="grid grid-cols-1 gap-4">
                                    <CompactSelect
                                        label="Multiple pages"
                                        value={localConfig.multiplePages}
                                        onChange={(e: any) => handleMultiplePagesChange(e.target.value)}
                                        options={[
                                            { value: 'normal', label: 'Normal' },
                                            { value: 'mirrorMargins', label: 'Mirror margins' },
                                            { value: 'bookFold', label: 'Book fold' },
                                            { value: 'twoPagesPerSheet', label: '2 pages per sheet' },
                                        ]}
                                    />
                                    {localConfig.multiplePages === 'bookFold' && (
                                        <div className="animate-in slide-in-from-top-2 fade-in">
                                            <CompactSelect
                                                label="Sheets per booklet"
                                                value={localConfig.sheetsPerBooklet}
                                                onChange={(e: any) => handleSheetsPerBookletChange(e.target.value)}
                                                options={[
                                                    { value: 'all', label: 'All' },
                                                    { value: '16', label: '16' },
                                                    { value: '8', label: '8' },
                                                    { value: '4', label: '4' },
                                                    { value: '2', label: '2' },
                                                ]}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {marginSubTab === 'apply' && <ApplyToSection />}
                    </div>
                )}

                {activeTab === 'paper' && (
                    <div className="animate-in slide-in-from-right-4 duration-300 fade-in">
                        {paperSubTab === 'size' && (
                            <div className="flex flex-col gap-5 pt-2">
                                <CompactSelect 
                                    label="Paper size" 
                                    value={localConfig.size} 
                                    onChange={(e: any) => handlePaperSizeChange(e.target.value as PageSize)}
                                    options={[
                                        { value: 'Letter', label: 'Letter (8.5" x 11")' },
                                        { value: 'Legal', label: 'Legal (8.5" x 14")' },
                                        { value: 'Executive', label: 'Executive (7.25" x 10.5")' },
                                        { value: 'A3', label: 'A3 (11.69" x 16.54")' },
                                        { value: 'A4', label: 'A4 (8.27" x 11.69")' },
                                        { value: 'A5', label: 'A5 (5.83" x 8.27")' },
                                        { value: 'B4 (JIS)', label: 'B4 JIS (9.84" x 13.90")' },
                                        { value: 'B5 (JIS)', label: 'B5 JIS (6.93" x 9.84")' },
                                        { value: 'Statement', label: 'Statement (5.5" x 8.5")' },
                                        { value: 'Tabloid', label: 'Tabloid (11" x 17")' },
                                        { value: 'Note', label: 'Note (8.5" x 11")' },
                                        { value: 'Envelope #10', label: 'Envelope #10 (4.125" x 9.5")' },
                                        { value: 'Envelope DL', label: 'Envelope DL (4.33" x 8.66")' },
                                        { value: 'Custom', label: 'Custom Size' },
                                    ]}
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <CompactInput 
                                        label="Width" 
                                        value={localConfig.customWidth || (PAGE_SIZES.Letter.width / 96)} 
                                        onChange={(e: any) => setLocalConfig(prev => ({...prev, size: 'Custom', customWidth: parseFloat(e.target.value)}))} 
                                    />
                                    <CompactInput 
                                        label="Height" 
                                        value={localConfig.customHeight || (PAGE_SIZES.Letter.height / 96)} 
                                        onChange={(e: any) => setLocalConfig(prev => ({...prev, size: 'Custom', customHeight: parseFloat(e.target.value)}))} 
                                    />
                                </div>
                            </div>
                        )}

                        {paperSubTab === 'source' && (
                            <div className="flex flex-col gap-3 pt-2">
                                <CompactSelect 
                                    label="First page" 
                                    value={localConfig.paperSourceFirstPage || 'Default tray'} 
                                    onChange={(e: any) => setLocalConfig({...localConfig, paperSourceFirstPage: e.target.value})}
                                    options={[
                                        { value: 'Default tray', label: 'Default tray (Auto Select)' },
                                        { value: 'Manual Feed', label: 'Manual Feed' },
                                    ]}
                                />
                                <CompactSelect 
                                    label="Other pages" 
                                    value={localConfig.paperSourceOtherPages || 'Default tray'} 
                                    onChange={(e: any) => setLocalConfig({...localConfig, paperSourceOtherPages: e.target.value})}
                                    options={[
                                        { value: 'Default tray', label: 'Default tray (Auto Select)' },
                                        { value: 'Manual Feed', label: 'Manual Feed' },
                                    ]}
                                />
                            </div>
                        )}

                        {paperSubTab === 'apply' && <ApplyToSection />}
                    </div>
                )}

                {activeTab === 'layout' && (
                    <div className="animate-in slide-in-from-right-4 duration-300 fade-in">
                        {layoutSubTab === 'section' && (
                            <div className="flex flex-col gap-5 pt-2">
                                <CompactSelect 
                                    label="Section Start" 
                                    value={localConfig.sectionStart} 
                                    onChange={(e: any) => setLocalConfig({...localConfig, sectionStart: e.target.value})}
                                    options={[
                                        { value: 'newpage', label: 'New Page' },
                                        { value: 'continuous', label: 'Continuous' },
                                        { value: 'even', label: 'Even Page' },
                                        { value: 'odd', label: 'Odd Page' },
                                    ]}
                                />
                            </div>
                        )}

                        {layoutSubTab === 'headers' && (
                            <div className="flex flex-col gap-5 pt-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <CompactInput label="Header" value={localConfig.headerDistance} onChange={(e: any) => setLocalConfig({...localConfig, headerDistance: parseFloat(e.target.value)})} />
                                    <CompactInput label="Footer" value={localConfig.footerDistance} onChange={(e: any) => setLocalConfig({...localConfig, footerDistance: parseFloat(e.target.value)})} />
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${localConfig.differentFirstPage ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-blue-400'}`}>
                                            {localConfig.differentFirstPage && <Check size={12} className="text-white" strokeWidth={3} />}
                                        </div>
                                        <input type="checkbox" checked={localConfig.differentFirstPage} onChange={(e) => setLocalConfig({...localConfig, differentFirstPage: e.target.checked})} className="hidden" />
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Different first page</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${localConfig.differentOddEven ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-blue-400'}`}>
                                            {localConfig.differentOddEven && <Check size={12} className="text-white" strokeWidth={3} />}
                                        </div>
                                        <input type="checkbox" checked={localConfig.differentOddEven} onChange={(e) => setLocalConfig({...localConfig, differentOddEven: e.target.checked})} className="hidden" />
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Different odd & even pages</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {layoutSubTab === 'page' && (
                            <div className="flex flex-col gap-5 pt-2">
                                <CompactSelect 
                                    label="Vertical Alignment" 
                                    value={localConfig.verticalAlign} 
                                    onChange={(e: any) => setLocalConfig({...localConfig, verticalAlign: e.target.value})}
                                    options={[
                                        { value: 'top', label: 'Top' },
                                        { value: 'center', label: 'Center' },
                                        { value: 'justify', label: 'Justified' },
                                        { value: 'bottom', label: 'Bottom' },
                                    ]}
                                />
                            </div>
                        )}

                        {layoutSubTab === 'apply' && <ApplyToSection />}
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <button 
                onClick={() => alert("Defaults not yet implemented.")}
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1.5 group"
            >
                <Monitor size={14} className="group-hover:scale-110 transition-transform"/> Set As Default
            </button>
            <div className="flex gap-3">
                <button 
                    onClick={onClose} 
                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-lg transition-all"
                >
                    Cancel
                </button>
                <button 
                    onClick={() => { onSave(localConfig); onClose(); }} 
                    className="px-6 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95"
                >
                    OK
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
