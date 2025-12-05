
import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FileText, FileType, Printer, Settings2, ChevronDown, Loader2, 
  ChevronLeft, ChevronRight, LayoutTemplate, Check, X, Copy,
  Maximize2, Minimize2, Monitor
} from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useFileTab } from '../FileTabContext';
import { paginateContent } from '../../../../../utils/layoutEngine';
import { PAGE_SIZES, MARGIN_PRESETS } from '../../../../../constants';
import { PageConfig, PageSize, PageOrientation, MarginPreset } from '../../../../../types';

// --- Portal-Based Select Component ---
// Fixes z-index clipping issues in modals/floating boxes
const PrintSelect = ({ label, value, onChange, options, icon: Icon, disabled, className = "" }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        
        if (!isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Check space below
            const spaceBelow = window.innerHeight - rect.bottom;
            const heightNeeded = Math.min(options.length * 36, 300);
            let top = rect.bottom + 4;
            let origin = 'top';
            
            if (spaceBelow < heightNeeded && rect.top > heightNeeded) {
                top = rect.top - 4; // will need to subtract height in render or use bottom positioning
                origin = 'bottom';
            }

            setCoords({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width
            });
        }
        setIsOpen(!isOpen);
    };

    // Close listeners
    useEffect(() => {
        if (!isOpen) return;
        const close = () => setIsOpen(false);
        // Capture phase for scroll to catch scrolling in parent containers
        window.addEventListener('scroll', close, true); 
        window.addEventListener('resize', close);
        window.addEventListener('click', close);
        return () => {
            window.removeEventListener('scroll', close, true);
            window.removeEventListener('resize', close);
            window.removeEventListener('click', close);
        };
    }, [isOpen]);

    const selectedLabel = options.find((o: any) => o.value === value)?.label || value;

    return (
        <div className={`relative ${className}`}>
            <button
                ref={triggerRef}
                onClick={toggle}
                disabled={disabled}
                className={`w-full text-left px-4 py-3 bg-white border rounded-xl transition-all shadow-sm flex items-center justify-between group ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200 hover:border-blue-400'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {Icon && <Icon size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors shrink-0"/>}
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</span>
                        <span className="text-sm font-medium text-slate-700 truncate">{selectedLabel}</span>
                    </div>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}/>
            </button>

            {isOpen && createPortal(
                <div 
                    className="fixed z-[9999] bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col"
                    style={{ 
                        top: coords.top, 
                        left: coords.left, 
                        width: coords.width,
                        maxHeight: '300px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200">
                        {options.map((opt: any) => (
                            <button
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors flex items-center justify-between ${opt.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                            >
                                <span className="truncate">{opt.label}</span>
                                {opt.value === value && <Check size={14} className="shrink-0 text-blue-600"/>}
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

// --- Main Print Modal ---

export const PrintModal: React.FC = () => {
  const { content, pageConfig: globalConfig, headerContent, footerContent, documentTitle } = useEditor();
  const { closeModal } = useFileTab();
  
  // Local Config
  const [localConfig, setLocalConfig] = useState<PageConfig>({ ...globalConfig });
  
  // UI State
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  
  // Pagination & Preview State
  const [paginatedPages, setPaginatedPages] = useState<{ html: string, config: PageConfig }[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [isPaginationReady, setIsPaginationReady] = useState(false);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Detect Mobile
  useLayoutEffect(() => {
      const checkMobile = () => {
          setIsMobile(window.innerWidth < 1024);
      };
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Pagination Logic
  useEffect(() => {
    setIsPaginationReady(false);
    const timer = setTimeout(() => {
        const result = paginateContent(content, localConfig);
        setPaginatedPages(result.pages);
        setIsPaginationReady(true);
        if (currentPreviewIndex >= result.pages.length) {
            setCurrentPreviewIndex(0);
        }
    }, 150); 
    return () => clearTimeout(timer);
  }, [content, localConfig]);

  // Auto-Scale Preview
  useLayoutEffect(() => {
      const updateScale = () => {
          if (previewContainerRef.current) {
              const container = previewContainerRef.current;
              const { clientWidth, clientHeight } = container;
              
              const cfg = paginatedPages[currentPreviewIndex]?.config || localConfig;
              const base = PAGE_SIZES[cfg.size as string] || PAGE_SIZES['Letter'];
              let pageW = base.width;
              let pageH = base.height;
              
              if (cfg.orientation === 'landscape') {
                  const temp = pageW; pageW = pageH; pageH = temp;
              }
              
              // Padding factor
              const padding = isMobile ? 32 : 64;
              const availableW = clientWidth - padding;
              const availableH = clientHeight - padding;
              
              const scaleW = availableW / pageW;
              const scaleH = availableH / pageH;
              
              setPreviewScale(Math.min(scaleW, scaleH, 1.5)); // Cap max zoom
          }
      };
      
      updateScale();
      window.addEventListener('resize', updateScale);
      return () => window.removeEventListener('resize', updateScale);
  }, [paginatedPages, currentPreviewIndex, isMobile, localConfig]);


  const handlePrint = () => {
    setIsPreparingPrint(true);
    setTimeout(() => {
        const pagesToPrint = paginatedPages.length > 0 ? paginatedPages : paginateContent(content, localConfig).pages;
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Please allow popups to print");
            setIsPreparingPrint(false);
            return;
        }

        const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>${documentTitle || 'Document'}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Serif:ital,wght@0,400;0,700;1,400&display=swap');
                @page { margin: 0; size: auto; }
                body { margin: 0; padding: 0; background: white; font-family: 'Calibri', 'Inter', sans-serif; }
                .print-page { position: relative; overflow: hidden; margin: 0 auto; page-break-after: always; }
                .print-header, .print-footer { position: absolute; left: 0; right: 0; overflow: hidden; z-index: 10; }
                .print-header { top: 0; }
                .print-footer { bottom: 0; }
                .print-content { position: absolute; overflow: hidden; z-index: 5; }
                .prodoc-editor { font-size: 11pt; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; }
                img { max-width: 100%; }
                table { border-collapse: collapse; width: 100%; }
                td, th { border: 1px solid #000; padding: 4px 8px; vertical-align: top; }
            </style>
          </head>
          <body>
            ${pagesToPrint.map((page, index) => {
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
            }).join('')}
            <script>window.onload = function() { setTimeout(() => { window.print(); }, 500); };</script>
          </body>
          </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setIsPreparingPrint(false);
    }, 500);
  };

  const handleSettingChange = (key: keyof PageConfig | 'marginPreset', value: any) => {
      setLocalConfig(prev => {
          const next = { ...prev, [key]: value };
          if (key === 'marginPreset' && value !== 'custom') {
              next.margins = MARGIN_PRESETS[value as string];
          }
          return next;
      });
  };

  // Render Content for the Settings Panel (Reused in Desktop Sidebar & Mobile Modal)
  const SettingsPanel = () => (
      <div className="space-y-4">
           <PrintSelect
               label="Printer"
               value="default"
               onChange={() => {}}
               options={[{ value: 'default', label: 'Microsoft Print to PDF' }, { value: 'save', label: 'Save as PDF' }]}
               icon={Printer}
               disabled
           />
           
           <div className="h-px bg-slate-200 my-2"></div>
           
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
               options={Object.keys(PAGE_SIZES).map(s => ({ value: s, label: s }))}
               icon={FileText}
           />

           <PrintSelect
               label="Margins"
               value={localConfig.marginPreset}
               onChange={(v: any) => handleSettingChange('marginPreset', v)}
               options={Object.keys(MARGIN_PRESETS).map(m => ({ value: m, label: m.charAt(0).toUpperCase() + m.slice(1) + " Margins" }))}
               icon={LayoutTemplate}
           />

           <button className="w-full text-left px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 transition-colors flex items-center gap-3 text-slate-600 group">
               <Settings2 size={18} className="text-slate-400 group-hover:text-blue-500"/>
               <span className="text-sm font-medium">Page Setup...</span>
           </button>
      </div>
  );

  // Render Preview Page
  const renderPreviewPage = () => {
      if (!isPaginationReady) return null;
      const page = paginatedPages[currentPreviewIndex];
      if (!page) return null;

      const cfg = page.config;
      const base = PAGE_SIZES[cfg.size as string] || PAGE_SIZES['Letter'];
      const w = cfg.orientation === 'portrait' ? base.width : base.height;
      const h = cfg.orientation === 'portrait' ? base.height : base.width;
      
      const mt = cfg.margins.top * 96;
      const mb = cfg.margins.bottom * 96;
      const ml = cfg.margins.left * 96;
      const mr = cfg.margins.right * 96;

      // Scale Factors
      const scaleStyle = {
          width: w,
          height: h,
          transform: `scale(${previewScale})`,
          transformOrigin: 'center center'
      };

      return (
          <div 
              className="bg-white shadow-2xl transition-transform duration-300 ease-out origin-center relative"
              style={scaleStyle}
          >
              {/* Render Content Scaled */}
              <div className="absolute inset-0 overflow-hidden">
                  {/* Header Preview */}
                  <div className="absolute top-0 left-0 right-0" style={{ height: mt, paddingLeft: ml, paddingRight: mr, paddingTop: (cfg.headerDistance||0.5)*96 }}>
                      <div className="opacity-50 origin-top-left transform scale-75 w-[133%] h-[133%]" dangerouslySetInnerHTML={{ __html: headerContent || '' }} />
                  </div>
                  
                  {/* Body Preview */}
                  <div className="absolute" style={{ top: mt, bottom: mb, left: ml, right: mr, overflow: 'hidden' }}>
                       <div className="prodoc-editor transform origin-top-left" style={{zoom: 1}} dangerouslySetInnerHTML={{ __html: page.html }} />
                  </div>

                  {/* Footer Preview */}
                  <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end" style={{ height: mb, paddingLeft: ml, paddingRight: mr, paddingBottom: (cfg.footerDistance||0.5)*96 }}>
                      <div className="opacity-50 origin-bottom-left transform scale-75 w-[133%] h-[133%]" dangerouslySetInnerHTML={{ 
                          __html: (footerContent || '').replace(/\[Page \d+\]/g, `[Page ${currentPreviewIndex + 1}]`).replace(/<span class="page-number-placeholder">.*?<\/span>/g, `${currentPreviewIndex + 1}`) 
                      }} />
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col lg:flex-row h-full -m-4 md:-m-6 lg:-m-8 bg-[#525659] relative overflow-hidden">
      
      {/* Desktop Sidebar (Left) */}
      <div className="hidden lg:flex w-[320px] bg-[#f8f9fa] border-r border-slate-300 flex-col z-20 shadow-xl">
          <div className="p-6 border-b border-slate-200 bg-white flex items-center gap-3">
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <ChevronLeft size={20} className="text-slate-600"/>
              </button>
              <h2 className="text-xl font-bold text-slate-800">Print</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <button 
                onClick={handlePrint}
                disabled={!isPaginationReady || isPreparingPrint}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none"
              >
                {isPreparingPrint ? <Loader2 className="animate-spin"/> : <Printer size={24}/>}
                <span>{isPreparingPrint ? 'Preparing...' : 'Print'}</span>
              </button>
              
              <SettingsPanel />
          </div>
      </div>

      {/* Mobile Top Bar */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-[#2d3032] flex items-center justify-between px-4 z-30 shadow-md">
          <button onClick={closeModal} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft size={24} />
          </button>
          <span className="text-white font-semibold">Print Preview</span>
          <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Preview Area (Center) */}
      <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden lg:pt-0 pt-16" ref={previewContainerRef}>
          
          {/* Background Texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>

          {/* Page Container */}
          <div className="relative z-10 transition-all duration-300 flex items-center justify-center w-full h-full p-8">
              {isPaginationReady ? renderPreviewPage() : (
                  <div className="flex flex-col items-center gap-3 text-white/60">
                      <Loader2 size={40} className="animate-spin"/>
                      <span className="text-sm font-medium tracking-wide">Generating Preview...</span>
                  </div>
              )}
          </div>

          {/* Page Navigation & Zoom Controls */}
          <div className="absolute bottom-8 flex items-center gap-4 bg-[#2d3032]/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl border border-white/10 z-20">
              <button onClick={() => setCurrentPreviewIndex(Math.max(0, currentPreviewIndex - 1))} disabled={currentPreviewIndex === 0} className="hover:text-blue-400 disabled:opacity-30 transition-colors"><ChevronLeft size={20}/></button>
              <span className="text-xs font-mono font-medium min-w-[60px] text-center select-none">
                  {currentPreviewIndex + 1} / {paginatedPages.length || 1}
              </span>
              <button onClick={() => setCurrentPreviewIndex(Math.min(paginatedPages.length - 1, currentPreviewIndex + 1))} disabled={currentPreviewIndex >= paginatedPages.length - 1} className="hover:text-blue-400 disabled:opacity-30 transition-colors"><ChevronRight size={20}/></button>
              
              <div className="w-px h-4 bg-white/20 mx-1"></div>
              
              <button onClick={() => setPreviewScale(s => Math.max(0.2, s - 0.1))} className="hover:text-blue-400 transition-colors"><Minimize2 size={16}/></button>
              <span className="text-xs w-10 text-center">{Math.round(previewScale * 100)}%</span>
              <button onClick={() => setPreviewScale(s => Math.min(2.0, s + 0.1))} className="hover:text-blue-400 transition-colors"><Maximize2 size={16}/></button>
          </div>
      </div>

      {/* Mobile Action Buttons (FABs) */}
      <div className="lg:hidden absolute bottom-6 right-6 flex flex-col gap-4 z-40">
          <button 
            onClick={() => setShowMobileSettings(true)}
            className="w-14 h-14 bg-white text-slate-700 rounded-full shadow-xl flex items-center justify-center border border-slate-100 active:scale-90 transition-all"
          >
              <Settings2 size={24} />
          </button>
          
          <button 
            onClick={handlePrint}
            disabled={!isPaginationReady}
            className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-600/40 flex items-center justify-center active:scale-90 transition-all disabled:opacity-50 disabled:shadow-none"
          >
              <Printer size={28} />
          </button>
      </div>

      {/* Mobile Floating Settings Box (Centered Overlay) */}
      {isMobile && showMobileSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div 
                className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
              >
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-800 text-lg">Print Settings</h3>
                      <button onClick={() => setShowMobileSettings(false)} className="p-2 bg-white hover:bg-slate-100 rounded-full text-slate-500 transition-colors shadow-sm border border-slate-200">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto custom-scrollbar">
                      <SettingsPanel />
                  </div>
                  
                  <div className="p-5 border-t border-slate-100 bg-slate-50">
                      <button 
                        onClick={() => setShowMobileSettings(false)}
                        className="w-full py-3.5 bg-slate-800 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all"
                      >
                          Done
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
