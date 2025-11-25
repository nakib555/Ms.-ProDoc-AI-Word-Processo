
import React, { useState, useEffect } from 'react';
import { X, LayoutTemplate, FileText, ChevronDown } from 'lucide-react';
import { PageConfig, PageSize, PageOrientation, VerticalAlignment } from '../types';
import { PAGE_SIZES } from '../constants';

interface PageSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  config: PageConfig;
  onSave: (config: PageConfig) => void;
}

type Tab = 'margins' | 'paper' | 'layout';

export const PageSetupDialog: React.FC<PageSetupDialogProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('margins');
  const [localConfig, setLocalConfig] = useState<PageConfig>(config);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(JSON.parse(JSON.stringify(config)));
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleInputChange = (section: keyof PageConfig['margins'], value: string) => {
    let numVal = parseFloat(value);
    if (isNaN(numVal)) numVal = 0;
    
    setLocalConfig(prev => ({
      ...prev,
      marginPreset: 'custom',
      margins: {
        ...prev.margins,
        [section]: numVal
      }
    }));
  };

  const handleOrientationChange = (orientation: PageOrientation) => {
    if (orientation !== localConfig.orientation) {
        let newWidth = localConfig.customWidth;
        let newHeight = localConfig.customHeight;
        
        if (localConfig.size !== 'Custom') {
             // Calculate dimensions from size if not custom
             // The constant PAGE_SIZES stores values in pixels (96 DPI)
             const base = PAGE_SIZES[localConfig.size as keyof typeof PAGE_SIZES] || PAGE_SIZES.Letter;
             newWidth = base.width / 96;
             newHeight = base.height / 96;
        }

        // Swap dimensions
        const temp = newWidth;
        newWidth = newHeight;
        newHeight = temp;

        setLocalConfig(prev => ({
            ...prev,
            orientation,
            customWidth: newWidth,
            customHeight: newHeight
        }));
    }
  };

  const handlePaperSizeChange = (size: PageSize) => {
      let w, h;
      
      switch(size) {
          case 'Letter': w = 8.5; h = 11; break;
          case 'Legal': w = 8.5; h = 14; break;
          case 'Executive': w = 7.25; h = 10.5; break;
          case 'A3': w = 11.69; h = 16.54; break;
          case 'A4': w = 8.27; h = 11.69; break;
          case 'A5': w = 5.83; h = 8.27; break;
          case 'B4 (JIS)': w = 9.84; h = 13.90; break;
          case 'B5 (JIS)': w = 6.93; h = 9.84; break;
          case 'Statement': w = 5.5; h = 8.5; break;
          case 'Tabloid': w = 11; h = 17; break;
          case 'Note': w = 8.5; h = 11; break;
          case 'Envelope #10': w = 4.125; h = 9.5; break;
          case 'Envelope DL': w = 4.33; h = 8.66; break;
          default: break;
      }
      
      if (localConfig.orientation === 'landscape' && w && h) {
          const temp = w; w = h; h = temp;
      }

      setLocalConfig(prev => ({
          ...prev,
          size,
          customWidth: w || prev.customWidth,
          customHeight: h || prev.customHeight
      }));
  };

  // Helper Components
  const CompactInput = ({ label, value, onChange, suffix = '"' }: any) => (
    <div className="flex items-center justify-between bg-slate-50 hover:bg-white rounded-md border border-slate-200 hover:border-blue-300 px-2.5 py-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all group">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-blue-600">{label}</span>
        <div className="flex items-center gap-0.5">
            <input 
                type="number" 
                step="0.1" 
                className="w-12 text-right bg-transparent text-xs font-semibold text-slate-700 outline-none p-0"
                value={value}
                onChange={onChange}
                onBlur={(e) => { if (!e.target.value) onChange({target: {value: '0'}}); }}
            />
            <span className="text-[10px] text-slate-400 font-medium">{suffix}</span>
        </div>
    </div>
  );

  const CompactSelect = ({ label, value, onChange, options }: any) => (
    <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</span>
        <div className="relative">
            <select 
                value={value} 
                onChange={onChange}
                className="w-full appearance-none bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-300 rounded-md pl-2.5 pr-8 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-[340px] rounded-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
                <LayoutTemplate size={14} className="text-blue-600"/> Page Setup
            </h2>
            <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 hover:bg-slate-100 rounded-full"
            >
                <X size={16} />
            </button>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-4 pb-1 bg-white dark:bg-slate-900">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {['margins', 'paper', 'layout'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as Tab)}
                        className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all duration-200 ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm scale-100' : 'text-slate-500 hover:text-slate-700 scale-95'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        {/* Content */}
        <div className="p-4 min-h-[260px] bg-white dark:bg-slate-900">
            {activeTab === 'margins' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    {/* Mini Visual Preview */}
                    <div className="flex justify-center py-2">
                        <div 
                            className="bg-white border shadow-sm transition-all relative flex items-center justify-center"
                            style={{
                                width: localConfig.orientation === 'portrait' ? '60px' : '80px',
                                height: localConfig.orientation === 'portrait' ? '80px' : '60px',
                                borderColor: '#94a3b8',
                                borderRadius: '3px'
                            }}
                        >
                            <div className="absolute inset-0 border border-dashed border-slate-300 m-1"></div>
                            <div className="w-8 h-0.5 bg-slate-200 rounded-full mb-1"></div>
                            <div className="w-6 h-0.5 bg-slate-200 rounded-full mb-1"></div>
                            <div className="w-8 h-0.5 bg-slate-200 rounded-full"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <CompactInput label="Top" value={localConfig.margins.top} onChange={(e: any) => handleInputChange('top', e.target.value)} />
                        <CompactInput label="Bottom" value={localConfig.margins.bottom} onChange={(e: any) => handleInputChange('bottom', e.target.value)} />
                        <CompactInput label="Left" value={localConfig.margins.left} onChange={(e: any) => handleInputChange('left', e.target.value)} />
                        <CompactInput label="Right" value={localConfig.margins.right} onChange={(e: any) => handleInputChange('right', e.target.value)} />
                    </div>
                    
                    <div className="flex gap-2 pt-1">
                         <button 
                            onClick={() => handleOrientationChange('portrait')}
                            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg border transition-all ${localConfig.orientation === 'portrait' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-200' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-blue-300'}`}
                         >
                            <FileText size={16} />
                            <span className="text-[10px] font-bold mt-1 uppercase tracking-wide">Portrait</span>
                         </button>
                         <button 
                            onClick={() => handleOrientationChange('landscape')}
                            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg border transition-all ${localConfig.orientation === 'landscape' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-200' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-blue-300'}`}
                         >
                            <FileText size={16} className="rotate-90"/>
                            <span className="text-[10px] font-bold mt-1 uppercase tracking-wide">Landscape</span>
                         </button>
                    </div>
                </div>
            )}

            {activeTab === 'paper' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <CompactSelect 
                        label="Paper Size" 
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

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                        <CompactInput label="Width" value={localConfig.customWidth || 8.5} onChange={(e: any) => setLocalConfig({...localConfig, size: 'Custom', customWidth: parseFloat(e.target.value)})} />
                        <CompactInput label="Height" value={localConfig.customHeight || 11} onChange={(e: any) => setLocalConfig({...localConfig, size: 'Custom', customHeight: parseFloat(e.target.value)})} />
                    </div>

                    <div className="pt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 block mb-1">Source</span>
                        <select className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-600 outline-none focus:border-blue-500">
                            <option>Default Tray (Auto)</option>
                            <option>Manual Feed</option>
                        </select>
                    </div>
                </div>
            )}

            {activeTab === 'layout' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
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

                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <CompactInput label="Header" value={localConfig.headerDistance} onChange={(e: any) => setLocalConfig({...localConfig, headerDistance: parseFloat(e.target.value)})} />
                        <CompactInput label="Footer" value={localConfig.footerDistance} onChange={(e: any) => setLocalConfig({...localConfig, footerDistance: parseFloat(e.target.value)})} />
                    </div>

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
                    
                    <div className="pt-1 space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={localConfig.differentFirstPage} onChange={(e) => setLocalConfig({...localConfig, differentFirstPage: e.target.checked})} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
                            <span className="text-xs text-slate-600 group-hover:text-slate-900">Different first page</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={localConfig.differentOddEven} onChange={(e) => setLocalConfig({...localConfig, differentOddEven: e.target.checked})} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
                            <span className="text-xs text-slate-600 group-hover:text-slate-900">Different odd & even pages</span>
                        </label>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 backdrop-blur-sm">
            <button 
                onClick={onClose} 
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={() => { onSave(localConfig); onClose(); }} 
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-sm hover:shadow transition-all active:scale-95"
            >
                OK
            </button>
        </div>
      </div>
    </div>
  );
};
