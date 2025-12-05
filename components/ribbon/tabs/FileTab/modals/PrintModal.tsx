
import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FileText, FileType, Printer, Settings2, ChevronDown, Loader2, 
  LayoutTemplate, Check, X, ArrowLeft, Sliders, Eye, Copy
} from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useFileTab } from '../FileTabContext';
import { paginateContent } from '../../../../../utils/layoutEngine';
import { PAGE_SIZES, MARGIN_PRESETS, PAPER_FORMATS } from '../../../../../constants';
import { PageConfig, MarginPreset } from '../../../../../types';

// --- Shared UI Components ---

const PrintSelect = ({ label, value, onChange, options, icon: Icon, disabled, className = "" }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const [animateClass, setAnimateClass] = useState('');

    const updateLayout = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const margin = 8;

            const availableSpaceBelow = viewportHeight - rect.bottom - margin;
            const availableSpaceAbove = rect.top - margin;
            
            // Estimate height: ~40px per item + padding
            const contentHeight = options.length * 40 + 16;
            const idealMaxHeight = 300;

            let top: number | string = rect.bottom + 4;
            let bottom: number | string = 'auto';
            let maxHeight = Math.min(contentHeight, idealMaxHeight);
            let animation = 'zoom-in-95 origin-top';

            // Flip logic: if tight below but space above, flip up
            if (availableSpaceBelow < 220 && availableSpaceAbove > availableSpaceBelow) {
                top = 'auto';
                bottom = viewportHeight - rect.top + 4;
                maxHeight = Math.min(contentHeight, availableSpaceAbove, idealMaxHeight);
                animation = 'zoom-in-95 origin-bottom';
            } else {
                // Cap max height to available space below
                maxHeight = Math.min(maxHeight, Math.max(150, availableSpaceBelow));
            }

            // Horizontal constraint
            let left = rect.left;
            if (left + rect.width > viewportWidth - margin) {
                left = viewportWidth - rect.width - margin;
            }
            if (left < margin) left = margin;

            setDropdownStyle({
                top,
                bottom,
                left,
                width: rect.width,
                maxHeight,
                opacity: 1 // Make visible after position calc
            });
            setAnimateClass(animation);
        }
    };

    useLayoutEffect(() => {
        if (isOpen) {
            updateLayout();
            window.addEventListener('scroll', updateLayout, true); 
            window.addEventListener('resize', updateLayout);
            return () => {
                window.removeEventListener('scroll', updateLayout, true);
                window.removeEventListener('resize', updateLayout);
            };
        }
    }, [isOpen, options.length]);

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        setIsOpen(!isOpen);
    };

    const close = () => setIsOpen(false);

    useEffect(() => {
        if (!isOpen) return;
        window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, [isOpen]);

    const selectedLabel = options.find((o: any) => o.value === value)?.label || value;

    return (
        <div className={`relative ${className}`}>
            <button
                ref={triggerRef}
                onClick={toggle}
                disabled={disabled}
                className={`w-full text-left px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl transition-all shadow-sm flex items-center justify-between group ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {Icon && <Icon size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0"/>}
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{selectedLabel}</span>
                    </div>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}/>
            </button>

            {isOpen && createPortal(
                <div 
                    className={`fixed z-[9999] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in duration-100 flex flex-col ${animateClass}`}
                    style={{ 
                        ...dropdownStyle,
                        opacity: dropdownStyle.top || dropdownStyle.bottom ? 1 : 0
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        {options.map((opt: any) => (
                            <button
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors flex items-center justify-between ${opt.value === value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            >
                                <span className="truncate">{opt.label}</span>
                                {opt.value === value && <Check size={14} className="shrink-0 text-blue-600 dark:text-blue-400"/>}
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

// --- Helper to render page content consistently ---
const renderPageContent = (
    index: number, 
    page: { html: string, config: PageConfig }, 
    headerContent: string, 
    footerContent: string, 
    scale: number
) => {
    const cfg = page.config;
    const baseSize = PAGE_SIZES[cfg.size as string] || PAGE_SIZES['Letter'];
    
    const widthPt = cfg.orientation === 'landscape' ? baseSize.height : baseSize.width;
    const heightPt = cfg.orientation === 'landscape' ? baseSize.width : baseSize.height;
    
    // Visual dimensions
    const mt = cfg.margins.top * 96;
    const mb = cfg.margins.bottom * 96;
    const ml = cfg.margins.left * 96;
    const mr = cfg.margins.right * 96;
    const hd = (cfg.headerDistance || 0.5) * 96;
    const fd = (cfg.footerDistance || 0.5) * 96;
    
    const currentFooter = (footerContent || '').replace(/\[Page \d+\]/g, `[Page ${index + 1}]`)
                        .replace(/<span class="page-number-placeholder">.*?<\/span>/g, `${index + 1}`);

    // We use a wrapper to reserve the space, and an inner div with transform to scale the content
    // The wrapper size must be scaled, but the inner content stays at base size and is scaled down
    const scaledWidth = widthPt * scale;
    const scaledHeight = heightPt * scale;

    return (
        <div 
            key={index}
            style={{ 
                width: scaledWidth, 
                height: scaledHeight,
            }}
            className="relative shrink-0 select-none shadow-lg"
        >
            <div 
                className="bg-white transition-transform duration-200 origin-top-left absolute top-0 left-0 overflow-hidden"
                style={{
                    width: widthPt,
                    height: heightPt,
                    transform: `scale(${scale})`,
                }}
            >
                {/* Header */}
                <div 
                className="absolute left-0 right-0 overflow-hidden text-[10pt]"
                style={{ top: 0, height: mt, padding: `${hd}px ${mr}px 0 ${ml}px`, width: '100%' }}
                dangerouslySetInnerHTML={{__html: headerContent || ''}}
                />
                
                {/* Body Content */}
                <div 
                className="absolute overflow-hidden bg-white"
                style={{ 
                    top: mt, 
                    bottom: mb, 
                    left: ml, 
                    right: mr 
                }}
                >
                <div 
                    className="prodoc-editor w-full h-full"
                    style={{ 
                        width: '100%',
                        fontSize: '11pt' 
                    }}
                    dangerouslySetInnerHTML={{__html: page.html}}
                />
                </div>

                {/* Footer */}
                <div 
                className="absolute left-0 right-0 overflow-hidden text-[10pt] flex flex-col justify-end"
                style={{ bottom: 0, height: mb, padding: `0 ${mr}px ${fd}px ${ml}px`, width: '100%' }}
                dangerouslySetInnerHTML={{__html: currentFooter}}
                />
            </div>
        </div>
    );
};

// --- Preview Components ---

const DesktopPrintPreview: React.FC<{
    pages: { html: string, config: PageConfig }[];
    headerContent: string;
    footerContent: string;
    isPreparing: boolean;
}> = ({ pages, headerContent, footerContent, isPreparing }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useLayoutEffect(() => {
        const updateScale = () => {
            if (containerRef.current && pages.length > 0) {
                const containerWidth = containerRef.current.clientWidth;
                const padding = 64; 
                const availableWidth = containerWidth - padding;
                
                const firstPageConfig = pages[0].config;
                const baseSize = PAGE_SIZES[firstPageConfig.size as string] || PAGE_SIZES['Letter'];
                
                const widthPt = firstPageConfig.orientation === 'landscape' ? baseSize.height : baseSize.width;
                const docWidthPx = widthPt;
                
                // Desktop specific clamping
                const newScale = Math.min(1.2, Math.max(0.5, availableWidth / docWidthPx));
                setScale(newScale);
            }
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [pages]);

    return (
        <div 
            ref={containerRef}
            className="flex-1 bg-[#525659] dark:bg-slate-950/50 relative overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 flex flex-col items-center p-8"
        >
             {pages.length === 0 || isPreparing ? (
                 <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                     <Loader2 className="animate-spin" size={32} />
                     <span className="text-sm font-medium">{isPreparing ? 'Preparing print job...' : 'Generating Preview...'}</span>
                 </div>
             ) : (
                 <div className="flex flex-col gap-8 items-center w-full pb-24">
                     {pages.map((page, index) => renderPageContent(index, page, headerContent, footerContent, scale))}
                 </div>
             )}
        </div>
    );
};

const MobilePrintPreview: React.FC<{
    pages: { html: string, config: PageConfig }[];
    headerContent: string;
    footerContent: string;
    isPreparing: boolean;
    onPrint: () => void;
    isVisible: boolean;
}> = ({ pages, headerContent, footerContent, isPreparing, onPrint, isVisible }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0); // Initialize at 0 to prevent flash

    useLayoutEffect(() => {
        if (!isVisible) return;

        const updateScale = () => {
            if (containerRef.current && pages.length > 0) {
                const containerWidth = containerRef.current.clientWidth;
                if (containerWidth === 0) return;

                const padding = 32; // Mobile padding (16px each side)
                const availableWidth = Math.max(0, containerWidth - padding);
                
                const firstPageConfig = pages[0].config;
                const baseSize = PAGE_SIZES[firstPageConfig.size as string] || PAGE_SIZES['Letter'];
                
                const widthPt = firstPageConfig.orientation === 'landscape' ? baseSize.height : baseSize.width;
                const docWidthPx = widthPt || 816; // Fallback width
                
                // Mobile specific clamping
                const newScale = Math.min(0.85, availableWidth / docWidthPx);
                if (newScale > 0) setScale(newScale);
            }
        };

        // Immediate update
        updateScale();
        
        // Delayed updates to catch layout settling/transitions
        const t1 = setTimeout(updateScale, 50);
        const t2 = setTimeout(updateScale, 300);
        
        window.addEventListener('resize', updateScale);
        return () => {
            window.removeEventListener('resize', updateScale);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [pages, isVisible]);

    return (
        <div className="flex-1 relative overflow-hidden flex flex-col bg-[#f0f2f5] dark:bg-slate-950">
            <div 
                ref={containerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center p-4 pb-32"
            >
                {pages.length === 0 || isPreparing ? (
                     <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                         <Loader2 className="animate-spin" size={28} />
                         <span className="text-xs font-medium">{isPreparing ? 'Preparing...' : 'Loading...'}</span>
                     </div>
                 ) : (
                     <div className="flex flex-col gap-4 items-center w-full transition-opacity duration-300" style={{ opacity: scale > 0 ? 1 : 0 }}>
                         {pages.map((page, index) => renderPageContent(index, page, headerContent, footerContent, scale))}
                     </div>
                 )}
            </div>
            
            {/* Mobile Floating Action Button */}
            <div className="absolute bottom-6 right-6 z-30">
                 <button 
                    onClick={onPrint}
                    disabled={isPreparing}
                    className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-[0_8px_20px_rgba(37,99,235,0.4)] flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-all border-2 border-white/20 backdrop-blur-sm"
                 >
                    {isPreparing ? <Loader2 size={24} className="animate-spin"/> : <Printer size={24} />}
                 </button>
             </div>
        </div>
    );
};

const PrintSettingsPanel: React.FC<{
    localConfig: PageConfig;
    setLocalConfig: (fn: (prev: PageConfig) => PageConfig) => void;
    copies: number;
    setCopies: (c: number) => void;
    onPrint: () => void;
    isPreparing: boolean;
    closeModal: () => void;
    isMobile?: boolean;
}> = ({ localConfig, setLocalConfig, copies, setCopies, onPrint, isPreparing, closeModal, isMobile }) => {
    
    const handleSettingChange = (key: keyof PageConfig | 'marginPreset', value: any) => {
      setLocalConfig(prev => {
          const next = { ...prev, [key]: value };
          if (key === 'marginPreset' && value !== 'custom') {
              next.margins = MARGIN_PRESETS[value as string];
          }
          return next;
      });
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            {/* Desktop Header */}
            {!isMobile && (
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                     <button 
                        onClick={closeModal}
                        className="p-2 -ml-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                     >
                         <ArrowLeft size={20} />
                     </button>
                     <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                         Print
                     </h2>
                </div>
            )}

            {/* Scrollable Settings */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Printer</h3>
                    <PrintSelect
                        label="Destination"
                        value="default"
                        onChange={() => {}}
                        options={[{ value: 'default', label: 'Save as PDF / Default Printer' }]}
                        icon={Printer}
                        disabled
                    />
                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-sm">
                         <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Copies</span>
                             <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{copies}</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <button onClick={() => setCopies(Math.max(1, copies - 1))} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600">-</button>
                             <button onClick={() => setCopies(copies + 1)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600">+</button>
                         </div>
                    </div>
                </div>

                <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>

                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Page Settings</h3>
                    
                    <PrintSelect
                        label="Orientation"
                        value={localConfig.orientation}
                        onChange={(v: any) => handleSettingChange('orientation', v)}
                        options={[
                            { value: 'portrait', label: 'Portrait Orientation' },
                            { value: 'landscape', label: 'Landscape Orientation' }
                        ]}
                        icon={FileType}
                    />

                    <PrintSelect
                        label="Paper Size"
                        value={localConfig.size}
                        onChange={(v: any) => handleSettingChange('size', v)}
                        options={PAPER_FORMATS.map(f => ({ 
                            value: f.id, 
                            label: `${f.label} (${f.width} x ${f.height})` 
                        }))}
                        icon={FileText}
                    />

                    <PrintSelect
                        label="Margins"
                        value={localConfig.marginPreset}
                        onChange={(v: any) => handleSettingChange('marginPreset', v)}
                        options={Object.keys(MARGIN_PRESETS).map(m => ({ value: m, label: m.charAt(0).toUpperCase() + m.slice(1) + " Margins" }))}
                        icon={LayoutTemplate}
                    />
                </div>
                
                {/* Mobile Spacer for FAB */}
                {isMobile && <div className="h-20"></div>}
            </div>

            {/* Desktop Footer Action */}
            {!isMobile && (
                <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                    <button 
                        onClick={onPrint}
                        disabled={isPreparing}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-200/50 dark:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-70 active:scale-[0.98]"
                    >
                        {isPreparing ? <Loader2 className="animate-spin" size={20}/> : <Printer size={20}/>}
                        <span>{isPreparing ? 'Preparing...' : 'Print'}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Main Print Modal ---

export const PrintModal: React.FC = () => {
  const { content, pageConfig: globalConfig, headerContent, footerContent, documentTitle } = useEditor();
  const { closeModal } = useFileTab();
  
  const [mobileTab, setMobileTab] = useState<'settings' | 'preview'>('settings');
  const [localConfig, setLocalConfig] = useState<PageConfig>({ ...globalConfig });
  const [previewPages, setPreviewPages] = useState<{ html: string, config: PageConfig }[]>([]);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);
  const [copies, setCopies] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update preview when settings change
  useEffect(() => {
    const timer = setTimeout(() => {
        const result = paginateContent(content, localConfig);
        setPreviewPages(result.pages);
    }, 50); 
    return () => clearTimeout(timer);
  }, [content, localConfig]);

  const handlePrint = () => {
    setIsPreparingPrint(true);
    
    // 1. Generate Styles
    const printStyles = `
        @media print {
            body > *:not(#prodoc-print-container) { display: none !important; }
            body { background: white; height: auto; overflow: visible; }
            #prodoc-print-container { 
                display: block !important; 
                position: absolute !important; 
                top: 0 !important; 
                left: 0 !important; 
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
                z-index: 2147483647 !important; /* Max Z-Index */
            }
            @page { margin: 0; size: auto; }
            
            /* Ensure background graphics are printed if needed, though usually browser setting */
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        
        @media screen {
            #prodoc-print-container { display: none; }
        }

        /* Content Styles */
        .print-page { 
            position: relative; 
            overflow: hidden; 
            margin: 0 auto; 
            page-break-after: always; 
            background: white;
            box-sizing: border-box;
        }
        .print-page:last-child { page-break-after: auto; }

        .print-header, .print-footer { position: absolute; left: 0; right: 0; overflow: hidden; z-index: 10; }
        .print-header { top: 0; }
        .print-footer { bottom: 0; }
        .print-content { position: absolute; overflow: hidden; z-index: 5; }
        
        .prodoc-editor { 
            font-size: 11pt; 
            line-height: 1.5; 
            white-space: pre-wrap; 
            word-wrap: break-word; 
            font-family: 'Calibri', 'Inter', sans-serif; 
            color: black;
        }
        .prodoc-editor p { margin: 0; }
        
        img { max-width: 100%; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid #000; padding: 4px 8px; vertical-align: top; }
        
        /* Hide UI elements that might have been cloned */
        .equation-handle, .equation-dropdown { display: none !important; }
    `;

    // 2. Generate Content HTML
    const pagesHtml = previewPages.map((page, index) => {
        const cfg = page.config;
        const baseSize = PAGE_SIZES[cfg.size as string] || PAGE_SIZES['Letter'];
        let widthPt = cfg.orientation === 'landscape' ? baseSize.height : baseSize.width;
        let heightPt = cfg.orientation === 'landscape' ? baseSize.width : baseSize.height;
        
        const mt = cfg.margins.top * 96;
        const mb = cfg.margins.bottom * 96;
        const ml = cfg.margins.left * 96;
        const mr = cfg.margins.right * 96;
        const hd = (cfg.headerDistance || 0.5) * 96;
        const fd = (cfg.footerDistance || 0.5) * 96;

        const currentHeader = (headerContent || '').replace(/<div/g, '<div style="height:100%; display:flex; align-items:flex-end;"');
        const currentFooter = (footerContent || '').replace(/\[Page \d+\]/g, `[Page ${index + 1}]`).replace(/<span class="page-number-placeholder">.*?<\/span>/g, `${index + 1}`);

        return `
            <div class="print-page" style="width: ${widthPt}px; height: ${heightPt}px;">
                <div class="print-header" style="height: ${mt}px; padding-top: ${hd}px; padding-left: ${ml}px; padding-right: ${mr}px;">
                    <div style="width: 100%; height: 100%;">${headerContent ? currentHeader : ''}</div>
                </div>
                <div class="print-content" style="top: ${mt}px; bottom: ${mb}px; left: ${ml}px; right: ${mr}px;">
                    <div class="prodoc-editor">${page.html}</div>
                </div>
                <div class="print-footer" style="height: ${mb}px; padding-bottom: ${fd}px; padding-left: ${ml}px; padding-right: ${mr}px; display: flex; flex-direction: column; justify-content: flex-end;">
                    <div style="width: 100%;">${currentFooter}</div>
                </div>
            </div>
        `;
    }).join('');

    // 3. Inject into DOM
    const container = document.createElement('div');
    container.id = 'prodoc-print-container';
    container.innerHTML = pagesHtml;
    document.body.appendChild(container);

    const styleEl = document.createElement('style');
    styleEl.id = 'prodoc-print-styles';
    styleEl.innerHTML = printStyles;
    document.head.appendChild(styleEl);

    // 4. Trigger Print & Cleanup
    // Small delay to ensure DOM rendering and asset loading (if any)
    setTimeout(() => {
        const cleanup = () => {
            if (document.body.contains(container)) document.body.removeChild(container);
            if (document.head.contains(styleEl)) document.head.removeChild(styleEl);
            setIsPreparingPrint(false);
            window.removeEventListener('afterprint', cleanup);
        };

        window.addEventListener('afterprint', cleanup);
        
        try {
            window.print();
        } catch (e) {
            console.error("Print failed", e);
            cleanup(); // Cleanup if print throws
        }

        // Fallback cleanup for mobile browsers that don't support afterprint well or don't block
        setTimeout(cleanup, 1000); 
    }, 100);
  };

  return (
    <div 
        className="flex flex-col md:flex-row w-full h-full bg-white dark:bg-slate-950 overflow-hidden md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
    >
        {/* Mobile Header & Tabs */}
        {isMobile && (
            <div className="flex flex-col bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-30">
                <div className="flex items-center justify-between px-4 py-3">
                    <button 
                        onClick={closeModal}
                        className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Print</h2>
                    <div className="w-8"></div>
                </div>
                <div className="px-4 pb-3">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button 
                            onClick={() => setMobileTab('settings')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${mobileTab === 'settings' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                        >
                            <Sliders size={14} /> Settings
                        </button>
                        <button 
                            onClick={() => setMobileTab('preview')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${mobileTab === 'preview' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                        >
                            <Eye size={14} /> Preview
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Left Sidebar: Settings */}
        <div className={`
            w-full md:w-[360px] flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-full
            ${isMobile ? (mobileTab === 'settings' ? 'flex' : 'hidden') : 'flex'}
        `}>
            <PrintSettingsPanel 
                localConfig={localConfig}
                setLocalConfig={setLocalConfig}
                copies={copies}
                setCopies={setCopies}
                onPrint={handlePrint}
                isPreparing={isPreparingPrint}
                closeModal={closeModal}
                isMobile={isMobile}
            />
        </div>

        {/* Right Area: Preview */}
        <div className={`
            flex-1 bg-[#525659] dark:bg-slate-950 relative overflow-hidden flex flex-col
            ${isMobile ? (mobileTab === 'preview' ? 'flex' : 'hidden') : 'flex'}
        `}>
            {isMobile ? (
                <MobilePrintPreview 
                    pages={previewPages}
                    headerContent={headerContent}
                    footerContent={footerContent}
                    isPreparing={isPreparingPrint}
                    onPrint={handlePrint}
                    isVisible={mobileTab === 'preview'}
                />
            ) : (
                <DesktopPrintPreview 
                    pages={previewPages}
                    headerContent={headerContent}
                    footerContent={footerContent}
                    isPreparing={isPreparingPrint}
                />
            )}
        </div>
    </div>
  );
};
