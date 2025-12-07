
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Key, CheckCircle2, AlertTriangle, X, Save, ExternalLink, 
  Cpu, ChevronDown, Zap, Star, Sparkles, Check,
  Feather, Image as ImageIcon, Music, Type
} from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { GoogleGenAI } from "@google/genai";
import { LoadingSpinner } from '@/components/LoadingSpinner';

const TEXT_MODELS = [
    { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro (Preview)' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    { id: 'gemini-flash-latest', name: 'Gemini Flash (Latest)' },
    { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite' },
];

const IMAGE_MODELS = [
    { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image' },
    { id: 'gemini-3-pro-image-preview', name: 'Gemini 3.0 Pro Image' },
    { id: 'imagen-4.0-generate-001', name: 'Imagen 4' },
    { id: 'imagen-3.0-generate-001', name: 'Imagen 3' },
];

const AUDIO_MODELS = [
    { id: 'gemini-2.5-flash-preview-tts', name: 'Gemini 2.5 Flash TTS' },
];

const ModelBadge = ({ type }: { type: 'pro' | 'flash' | 'lite' | 'preview' | 'experimental' | 'image' | 'audio' }) => {
    const styles = {
        pro: "bg-indigo-100 text-indigo-700 border-indigo-200",
        flash: "bg-amber-100 text-amber-700 border-amber-200",
        lite: "bg-green-100 text-green-700 border-green-200",
        preview: "bg-slate-100 text-slate-600 border-slate-200",
        experimental: "bg-purple-100 text-purple-700 border-purple-200",
        image: "bg-pink-100 text-pink-700 border-pink-200",
        audio: "bg-blue-100 text-blue-700 border-blue-200"
    };
    
    const icons = {
        pro: <Star size={8} className="fill-current" />,
        flash: <Zap size={8} className="fill-current" />,
        lite: <Feather size={8} />,
        preview: null,
        experimental: <Sparkles size={8} />,
        image: <ImageIcon size={8} />,
        audio: <Music size={8} />
    };

    const labels = {
        pro: "Pro",
        flash: "Flash",
        lite: "Lite",
        preview: "Preview",
        experimental: "Exp",
        image: "Img",
        audio: "Aud"
    };

    return (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex items-center gap-1 uppercase tracking-wide ${styles[type]}`}>
            {icons[type]} {labels[type]}
        </span>
    );
};

const RichModelSelect = ({ value, onChange, options, disabled, icon: Icon }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const [animateClass, setAnimateClass] = useState('');
    const triggerRef = useRef<HTMLButtonElement>(null);

    const updateLayout = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const margin = 8;
            
            const availableSpaceBelow = viewportHeight - rect.bottom - margin;
            const availableSpaceAbove = rect.top - margin;
            
            const contentHeight = options.length * 50 + 16;
            const idealMaxHeight = 350;

            let top: number | string = rect.bottom + 4;
            let bottom: number | string = 'auto';
            let maxHeight = Math.min(contentHeight, idealMaxHeight);
            let animation = 'zoom-in-95 origin-top';

            if (availableSpaceBelow < maxHeight && availableSpaceAbove > availableSpaceBelow) {
                 top = 'auto';
                 bottom = viewportHeight - rect.top + 4;
                 maxHeight = Math.min(contentHeight, availableSpaceAbove, idealMaxHeight);
                 animation = 'zoom-in-95 origin-bottom';
            } else {
                 maxHeight = Math.min(maxHeight, availableSpaceBelow);
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

    const selectedOption = options.find((o: any) => o.id === value) || options[0];

    const getTraits = (id: string) => {
        const lower = id.toLowerCase();
        return {
            isPro: lower.includes('pro') || lower.includes('ultra'),
            isFlash: lower.includes('flash'),
            isLite: lower.includes('lite') || lower.includes('nano'),
            isPreview: lower.includes('preview'),
            isExperimental: lower.includes('experimental'),
            isImage: lower.includes('image') || lower.includes('imagen'),
            isAudio: lower.includes('audio') || lower.includes('tts')
        };
    };

    return (
        <>
            <button
                ref={triggerRef}
                onClick={() => {
                    if (!disabled) {
                        setIsOpen(!isOpen);
                    }
                }}
                className={`w-full flex items-center justify-between bg-white border rounded-xl px-3 py-2.5 text-sm outline-none transition-all shadow-sm group text-left ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-300 hover:border-blue-400'} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-1.5 rounded-lg shrink-0 bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-800 transition-colors`}>
                        <Icon size={16} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-700 truncate block">{selectedOption?.name || value}</span>
                        <span className="text-[10px] text-slate-400 font-mono truncate block">{selectedOption?.id || value}</span>
                    </div>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && createPortal(
                <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
                    <div 
                        className={`fixed z-[9999] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-100 flex flex-col ${animateClass}`}
                        style={{ 
                           ...dropdownStyle,
                           opacity: dropdownStyle.top || dropdownStyle.bottom ? 1 : 0 
                        }}
                    >
                        <div className="overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                            {options.map((option: any) => {
                                const traits = getTraits(option.id);
                                const isSelected = option.id === value;
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => { onChange(option.id); setIsOpen(false); }}
                                        className={`w-full flex items-start gap-3 p-2 rounded-lg transition-colors text-left group ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                    >
                                        <div className={`mt-0.5 p-1.5 rounded-md shrink-0 ${traits.isFlash ? 'text-amber-600 bg-amber-50' : 'text-slate-500 bg-slate-50'} ${isSelected ? 'ring-1 ring-inset ring-black/5' : ''}`}>
                                            {traits.isFlash ? <Zap size={14} className="fill-current"/> : <Icon size={14}/>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                <span className={`text-xs font-bold truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {option.name}
                                                </span>
                                                {traits.isPro && <ModelBadge type="pro" />}
                                                {traits.isFlash && <ModelBadge type="flash" />}
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[10px] text-slate-400 font-mono truncate">{option.id}</span>
                                                {traits.isLite && <ModelBadge type="lite" />}
                                                {traits.isPreview && <ModelBadge type="preview" />}
                                                {traits.isImage && <ModelBadge type="image" />}
                                                {traits.isAudio && <ModelBadge type="audio" />}
                                            </div>
                                        </div>
                                        {isSelected && <Check size={14} className="text-blue-600 mt-1 shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>,
                document.body
            )}
        </>
    );
};

export const ApiKeyTool: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  
  // Dialog State
  const [inputKey, setInputKey] = useState('');
  
  // Model Selections
  const [textModel, setTextModel] = useState('gemini-3-pro-preview');
  const [imageModel, setImageModel] = useState('gemini-2.5-flash-image');
  const [audioModel, setAudioModel] = useState('gemini-2.5-flash-preview-tts');

  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const localKey = localStorage.getItem('gemini_api_key');
    const envKey = process.env.API_KEY;
    
    // Load Model Preferences
    const storedTextModel = localStorage.getItem('gemini_model_text') || localStorage.getItem('gemini_model');
    const storedImageModel = localStorage.getItem('gemini_model_image');
    const storedAudioModel = localStorage.getItem('gemini_model_audio');

    if (storedTextModel) setTextModel(storedTextModel);
    if (storedImageModel) setImageModel(storedImageModel);
    if (storedAudioModel) setAudioModel(storedAudioModel);

    const effectiveKey = localKey || envKey;
    setHasKey(!!effectiveKey);
    if (localKey) setInputKey(localKey);
  }, []);

  const verifyKey = async () => {
    if (!inputKey.trim()) {
        setErrorMessage("Please enter an API key");
        return;
    }
    
    setVerifying(true);
    setErrorMessage('');
    setVerifyStatus('idle');

    try {
        const client = new GoogleGenAI({ apiKey: inputKey });
        // Simple test call
        await client.models.generateContent({
            model: textModel, // Use text model for verification
            contents: [{ role: "user", parts: [{ text: "Ping" }] }],
        });
        setVerifyStatus('valid');
    } catch (e: any) {
        console.error("API Verification Failed:", e);
        setVerifyStatus('invalid');
        setErrorMessage("Invalid API Key or Model access denied.");
    } finally {
        setVerifying(false);
    }
  };

  const saveAndClose = () => {
      localStorage.setItem('gemini_api_key', inputKey);
      
      // Save specific model preferences
      localStorage.setItem('gemini_model_text', textModel);
      localStorage.setItem('gemini_model_image', imageModel);
      localStorage.setItem('gemini_model_audio', audioModel);
      
      setHasKey(true);
      setShowDialog(false);
      setVerifyStatus('idle');
  };

  const clearKey = () => {
      localStorage.removeItem('gemini_api_key');
      localStorage.removeItem('gemini_model_text');
      localStorage.removeItem('gemini_model_image');
      localStorage.removeItem('gemini_model_audio');
      // Legacy cleanup
      localStorage.removeItem('gemini_model');

      setInputKey('');
      
      // Reset defaults
      setTextModel('gemini-3-pro-preview');
      setImageModel('gemini-2.5-flash-image');
      setAudioModel('gemini-2.5-flash-preview-tts');

      setHasKey(!!process.env.API_KEY);
      setVerifyStatus('idle');
      setErrorMessage('');
  };

  return (
    <>
        <div className="relative h-full">
          <RibbonButton
            icon={Key}
            label="API Key"
            onClick={() => setShowDialog(true)}
            title={hasKey ? "Configure AI Settings" : "Set API Key"}
            className={hasKey ? "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800" : "bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800"}
          />
          <div className="absolute top-1 right-1 pointer-events-none">
            {hasKey ? (
              <CheckCircle2 size={10} className="text-green-600 fill-white" />
            ) : (
              <AlertTriangle size={10} className="text-amber-600 fill-white animate-pulse" />
            )}
          </div>
        </div>

        {showDialog && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in" onClick={() => setShowDialog(false)}>
                <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md m-4 overflow-hidden animate-in zoom-in-95 flex flex-col h-[75vh] md:h-auto md:max-h-[85vh]" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Key size={18} className="text-blue-600"/> AI Configuration
                        </h3>
                        <button onClick={() => setShowDialog(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                        {/* API Key Section */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Gemini API Key</label>
                            <div className="relative">
                                <input 
                                    type="password" 
                                    value={inputKey}
                                    onChange={(e) => {
                                        setInputKey(e.target.value);
                                        setVerifyStatus('idle');
                                        setErrorMessage('');
                                    }}
                                    placeholder="Enter your key (AIzaSy...)"
                                    className={`w-full pl-3 pr-10 py-2.5 border rounded-lg text-sm outline-none transition-all font-mono ${verifyStatus === 'invalid' ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50' : verifyStatus === 'valid' ? 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 bg-green-50' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white'}`}
                                />
                                <div className="absolute right-3 top-3">
                                    {verifying ? <LoadingSpinner className="w-4 h-4 text-blue-500"/> : 
                                     verifyStatus === 'valid' ? <CheckCircle2 size={16} className="text-green-500"/> :
                                     verifyStatus === 'invalid' ? <AlertTriangle size={16} className="text-red-500"/> : null}
                                </div>
                            </div>
                            
                            {errorMessage && (
                                <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1 animate-in slide-in-from-top-1">
                                    <AlertTriangle size={12} /> {errorMessage}
                                </div>
                            )}
                            
                            {verifyStatus === 'valid' && (
                                <div className="flex items-center gap-1.5 text-xs text-green-600 mt-1 animate-in slide-in-from-top-1">
                                    <CheckCircle2 size={12} /> Key verified successfully!
                                </div>
                            )}
                        </div>

                        <div className="w-full h-px bg-slate-100"></div>

                        {/* Model Configuration */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Default Models</h4>
                            
                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-slate-600">Text Generation</label>
                                <RichModelSelect 
                                    value={textModel}
                                    onChange={setTextModel}
                                    options={TEXT_MODELS}
                                    icon={Type}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-slate-600">Image Generation</label>
                                <RichModelSelect 
                                    value={imageModel}
                                    onChange={setImageModel}
                                    options={IMAGE_MODELS}
                                    icon={ImageIcon}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-slate-600">Audio / Speech</label>
                                <RichModelSelect 
                                    value={audioModel}
                                    onChange={setAudioModel}
                                    options={AUDIO_MODELS}
                                    icon={Music}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                             <a 
                                href="https://aistudio.google.com/app/apikey" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-medium"
                             >
                                Get API Key <ExternalLink size={10} />
                             </a>
                             
                             {(inputKey || localStorage.getItem('gemini_api_key')) && (
                                 <button onClick={clearKey} className="text-xs text-slate-400 hover:text-red-600 transition-colors">
                                     Reset All Settings
                                 </button>
                             )}
                        </div>
                    </div>

                    <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                        <button 
                            onClick={verifyKey}
                            disabled={verifying || !inputKey}
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-slate-200 transition-all disabled:opacity-50 shadow-sm"
                        >
                            Verify
                        </button>
                        <button 
                            onClick={saveAndClose}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};
