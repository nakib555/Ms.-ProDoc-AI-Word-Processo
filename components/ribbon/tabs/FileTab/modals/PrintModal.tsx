
import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FileText, FileType, Printer, Settings2, ChevronDown, Loader2, 
  LayoutTemplate, Check, X, ArrowLeft, Sliders, Eye, Download,
  Ruler
} from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useFileTab } from '../FileTabContext';
import { paginateContent } from '../../../../../utils/layoutEngine';
import { PAGE_SIZES, MARGIN_PRESETS, PAPER_FORMATS } from '../../../../../constants';
import { PageConfig, MarginPreset } from '../../../../../types';
// @ts-ignore
import { Previewer } from 'pagedjs';

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
            
            const contentHeight = options.length * 40 + 16;
            const idealMaxHeight = 300;

            let top: number | string = rect.bottom + 4;
            let bottom: number | string = 'auto';
            let maxHeight = Math.min(contentHeight, idealMaxHeight);
            let animation = 'zoom-in-95 origin-top';

            if (availableSpaceBelow < 220 && availableSpaceAbove > availableSpaceBelow) {
                top = 'auto';
                bottom = viewportHeight - rect.top + 4;
                maxHeight = Math.min(contentHeight, availableSpaceAbove, idealMaxHeight);
                animation = 'zoom-in-95 origin-bottom';
            } else {
                maxHeight = Math.min(maxHeight, Math.max(150, availableSpaceBelow));
            }

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
                opacity: 1
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
const getVerticalAlignStyle = (align: string): React.CSSProperties => {
  const style: React.CSSProperties = { display: 'flex', flexDirection: 'column' };
  let justifyContent: 'center' | 'flex-end' | 'space-between' | 'flex-start' = 'flex-start';
  if (align === 'center') justifyContent = 'center';
  else if (align === 'bottom') justifyContent = 'flex-end';
  else if (align === 'justify') justifyContent = 'space-between';
  return { ...style, justifyContent };
};

const renderPageContent = (
    index: number, 
    page: { html: string, config: PageConfig }, 
    headerContent: string, 
    footerContent: string, 
    scale: number
) => {
    const cfg = page.config;
    
    // Calculate dimensions in Inches
    let widthIn = 0;
    let heightIn = 0;
    
    if (cfg.size === 'Custom' && cfg.customWidth && cfg.customHeight) {
        widthIn = cfg.customWidth;
        heightIn = cfg.customHeight;
    } else {
        const base = PAGE_SIZES[cfg.size as string] || PAGE_SIZES['Letter'];
        widthIn = cfg.orientation === 'landscape' ? base.height / 96 : base.width / 96;
        heightIn = cfg.orientation === 'landscape' ? base.width / 96 : base.height / 96;
    }

    // Margins in Inches
    const margins = {
        top: cfg.margins.top,
        bottom: cfg.margins.bottom,
        left: cfg.margins.left,
        right: cfg.margins.right,
        gutter: cfg.margins.gutter || 0
    };
    
    if (cfg.gutterPosition === 'top' && !['mirrorMargins', 'bookFold'].includes(cfg.multiplePages || '')) {
         margins.top += margins.gutter;
    } else {
         margins.left += margins.gutter;
    }
    
    // Header/Footer Distances in Inches
    const headerDistIn = cfg.headerDistance || 0.5;
    const footerDistIn = cfg.footerDistance || 0.5;

    // Placeholder Cleanup for Print/Preview
    let printHeader = headerContent;
    if (printHeader.includes('[Header]')) {
        printHeader = printHeader.replace('[Header]', '');
    }
    
    let printFooter = footerContent;
    // Replace page number placeholder with actual index
    printFooter = printFooter.replace(/\[Page \d+\]/g, `[Page ${index + 1}]`)
                             .replace(/<span class="page-number-placeholder">.*?<\/span>/g, `${index + 1}`);

    const scaledWidth = widthIn * 96 * scale;
    const scaledHeight = heightIn * 96 * scale;
    const verticalAlignStyle = getVerticalAlignStyle(cfg.verticalAlign);

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
                className="prodoc-page-sheet bg-white transition-transform duration-200 origin-top-left absolute top-0 left-0 overflow-hidden"
                style={{
                    width: `${widthIn}in`,
                    height: `${heightIn}in`,
                    transform: `scale(${scale})`,
                    // New Box Model using Physical Units
                    paddingTop: `${margins.top}in`,
                    paddingBottom: `${margins.bottom}in`,
                    paddingLeft: `${margins.left}in`,
                    paddingRight: `${margins.right}in`,
                    boxSizing: 'border-box'
                }}
            >
                {/* Header Area - Absolute */}
                <div 
                    className="absolute left-0 right-0 z-30"
                    style={{ 
                        top: 0, 
                        height: `${margins.top}in`, 
                        paddingTop: `${headerDistIn}in`, 
                        paddingLeft: `${margins.left}in`, 
                        paddingRight: `${margins.right}in` 
                    }}
                >
                    <div 
                        className="prodoc-header w-full h-full"
                        dangerouslySetInnerHTML={{__html: printHeader || ''}}
                    />
                </div>
                
                {/* Body Content */}
                <div 
                    className="relative w-full h-full overflow-hidden z-10"
                    style={{ ...verticalAlignStyle }}
                >
                    <div 
                        className="prodoc-editor w-full h-full outline-none text-lg leading-loose break-words"
                        style={{
                            fontFamily: 'Calibri, Inter, sans-serif',
                            color: '#000000',
                            flex: cfg.verticalAlign === 'justify' ? '1 1 auto' : undefined
                        }}
                        dangerouslySetInnerHTML={{__html: page.html}}
                    />
                </div>

                {/* Footer Area - Absolute */}
                <div 
                    className="absolute left-0 right-0 z-30"
                    style={{ 
                        bottom: 0, 
                        height: `${margins.bottom}in`, 
                        paddingBottom: `${footerDistIn}in`, 
                        paddingLeft: `${margins.left}in`, 
                        paddingRight: `${margins.right}in`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end'
                    }}
                >
                    <div 
                        className="prodoc-footer w-full"
                        dangerouslySetInnerHTML={{__html: printFooter}}
                    />
                </div>
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
                const widthPx = firstPageConfig.orientation === 'landscape' ? baseSize.height : baseSize.width;
                
                const newScale = Math.min(1.2, Math.max(0.5, availableWidth / widthPx));
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
                     <span className="text-sm font-medium">{isPreparing ? 'Preparing job...' : 'Generating Preview...'}</span>
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
    const [scale, setScale] = useState(0);

    useLayoutEffect(() => {
        if (!isVisible) return;

        const updateScale = () => {
            if (containerRef.current && pages.length > 0) {
                const containerWidth = containerRef.current.clientWidth;
                if (containerWidth === 0) return;

                const padding = 32; 
                const availableWidth = Math.max(0, containerWidth - padding);
                
                const firstPageConfig = pages[0].config;
                const baseSize = PAGE_SIZES[firstPageConfig.size as string] || PAGE_SIZES['Letter'];
                const widthPx = firstPageConfig.orientation === 'landscape' ? baseSize.height : baseSize.width;
                const docWidthPx = widthPx || 816;
                
                const newScale = Math.min(0.85, availableWidth / docWidthPx);
                if (newScale > 0) setScale(newScale);
            }
        };

        updateScale();
        const t1 = setTimeout(updateScale, 50);
        window.addEventListener('resize', updateScale);
        return () => {
            window.removeEventListener('resize', updateScale);
            clearTimeout(t1);
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
            
            <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-3">
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

    const formatPresetLabel = (preset: string) => {
        if (preset === 'office2003') return 'Office 2003 Default';
        if (preset === 'apa') return 'APA Style';
        if (preset === 'mla') return 'MLA Style';
        if (preset === 'chicago') return 'Chicago Style';
        const label = preset.replace(/([A-Z])/g, ' $1').trim();
        return label.charAt(0).toUpperCase() + label.slice(1) + " Margins";
    };

    const getDimensionsDisplay = () => {
        if (localConfig.size === 'Custom') {
             return `${localConfig.customWidth || 0} x ${localConfig.customHeight || 0} in`;
        }
        const format = PAPER_FORMATS.find(f => f.id === localConfig.size);
        if (format) {
            if (localConfig.orientation === 'landscape') {
                return `${format.height} x ${format.width}`;
            }
            return `${format.width} x ${format.height}`;
        }
        return "";
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
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
                    <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Page Settings</h3>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Ruler size={10} /> {getDimensionsDisplay()}
                        </span>
                    </div>
                    
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
                        options={Object.keys(MARGIN_PRESETS).map(m => ({ 
                            value: m, 
                            label: formatPresetLabel(m) 
                        }))}
                        icon={LayoutTemplate}
                    />
                </div>
                
                {isMobile && <div className="h-20"></div>}
            </div>

            {!isMobile && (
                <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex flex-col gap-3">
                    <button 
                        onClick={onPrint}
                        disabled={isPreparing}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-200/50 dark:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-70 active:scale-[0.98]"
                    >
                        {isPreparing ? <Loader2 className="animate-spin" size={20}/> : <Printer size={20}/>}
                        <span>{isPreparing ? 'Preparing...' : 'Print / Save as PDF'}</span>
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

  // Update internal preview (using layoutEngine for fast feedback) when settings change
  useEffect(() => {
    const timer = setTimeout(() => {
        const result = paginateContent(content, localConfig);
        setPreviewPages(result.pages);
    }, 50); 
    return () => clearTimeout(timer);
  }, [content, localConfig]);

  // Paged.js Print Implementation
  const handlePagedJsPrint = async () => {
      setIsPreparingPrint(true);

      try {
          // 1. Create container for Paged.js and hide everything else
          const printContainer = document.createElement('div');
          printContainer.id = 'paged-print-container';
          document.body.classList.add('printing-mode');
          document.body.appendChild(printContainer);

          // 2. Generate CSS for Paged.js based on localConfig
          const { size, orientation, margins } = localConfig;
          
          // Determine precise size string
          let sizeStr = `${size} ${orientation}`;
          if (size === 'Custom' && localConfig.customWidth && localConfig.customHeight) {
              sizeStr = `${localConfig.customWidth}in ${localConfig.customHeight}in`;
          } else {
              // If it's a standard size, Paged.js usually recognizes it, but we can be explicit if needed.
              // Using ID from constants which are standard names (Letter, A4, etc.)
              // Add orientation
              sizeStr = `${size} ${orientation}`;
          }

          const css = `
              @page {
                  size: ${sizeStr};
                  margin-top: ${margins.top}in;
                  margin-bottom: ${margins.bottom}in;
                  margin-left: ${margins.left}in;
                  margin-right: ${margins.right}in;
                  
                  @top-center {
                      content: element(header);
                  }
                  @bottom-center {
                      content: element(footer);
                  }
              }

              .pagedjs-header {
                  position: running(header);
                  width: 100%;
              }

              .pagedjs-footer {
                  position: running(footer);
                  width: 100%;
              }

              /* Ensure content typography matches editor */
              .paged-content {
                  font-family: 'Calibri', 'Inter', sans-serif;
                  font-size: 11pt;
                  line-height: 1.5;
                  color: black;
              }
              
              /* Styles for tables, images, etc. */
              .paged-content table { border-collapse: collapse; width: 100%; margin: 1em 0; }
              .paged-content td, .paged-content th { border: 1px solid #000; padding: 4px 8px; }
              .paged-content img { max-width: 100%; }
              
              /* Hide math tools in print */
              .equation-handle, .equation-dropdown { display: none !important; }
              
              /* Force breaks */
              .prodoc-page-break { break-after: page; height: 0; margin: 0; border: none; }
          `;

          // 3. Clean up Header/Footer HTML
          let cleanHeader = headerContent.replace('[Header]', '');
          let cleanFooter = footerContent; // Page numbers are handled by Paged.js via CSS counters usually, but here we inject HTML.
          // Paged.js doesn't auto-increment HTML content in running elements easily for each page unless using CSS counters.
          // Simple fix: If footer has a page number placeholder, use CSS counter
          if (cleanFooter.includes('page-number-placeholder')) {
               // Replace the span content with CSS counter
               // Note: 'content: counter(page)' works in CSS content property, not easily inside HTML structure unless using ::after
               // We'll try a CSS approach for the placeholder span.
               cleanFooter = cleanFooter.replace(/<span class="page-number-placeholder">.*?<\/span>/g, '<span class="pagedjs-page-number"></span>');
          }

          // Add dynamic CSS for page number
          const pageNumCss = `
             .pagedjs-page-number::after {
                 content: counter(page);
             }
          `;

          // 4. Build HTML Structure
          const htmlContent = `
              <div class="pagedjs-header">${cleanHeader}</div>
              <div class="pagedjs-footer">${cleanFooter}</div>
              <div class="paged-content">
                  ${content}
              </div>
          `;

          // 5. Run Previewer
          const previewer = new Previewer();
          
          // We pass the CSS as a style element in the "stylesheets" array or just inject it?
          // Previewer accepts an array of stylesheet URLs or style elements.
          // We'll create a temporary style element.
          const styleEl = document.createElement('style');
          styleEl.innerHTML = css + pageNumCss;
          document.head.appendChild(styleEl);

          // This renders the paginated content into printContainer
          await previewer.preview(htmlContent, [], printContainer);

          // 6. Trigger Print
          window.print();

          // 7. Cleanup happens in finally block, but we should wait for print dialog to close?
          // Browser behavior varies. We'll cleanup immediately after the blocking call returns (or async).
          
          // Remove style element
          if(document.head.contains(styleEl)) document.head.removeChild(styleEl);

      } catch (e) {
          console.error("Paged.js Print Error:", e);
          alert("Failed to prepare print layout.");
      } finally {
          // Remove container and class
          document.body.classList.remove('printing-mode');
          const container = document.getElementById('paged-print-container');
          if (container) container.remove();
          setIsPreparingPrint(false);
      }
  };

  return (
    <div 
        className="flex flex-col md:flex-row w-full h-full bg-white dark:bg-slate-950 overflow-hidden md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
    >
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

        <div className={`
            w-full md:w-[360px] flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-full
            ${isMobile ? (mobileTab === 'settings' ? 'flex' : 'hidden') : 'flex'}
        `}>
            <PrintSettingsPanel 
                localConfig={localConfig}
                setLocalConfig={setLocalConfig}
                copies={copies}
                setCopies={setCopies}
                onPrint={handlePagedJsPrint}
                onDownload={handlePagedJsPrint} // Reuse print logic for PDF download via browser
                isPreparing={isPreparingPrint}
                closeModal={closeModal}
                isMobile={isMobile}
            />
        </div>

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
                    onPrint={handlePagedJsPrint}
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
