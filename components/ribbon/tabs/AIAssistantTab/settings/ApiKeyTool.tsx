
import React, { useState, useEffect } from 'react';
import { Key, CheckCircle2, AlertTriangle, X, Loader2, Save, ExternalLink } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { GoogleGenAI } from "@google/genai";

export const ApiKeyTool: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  
  // Dialog State
  const [inputKey, setInputKey] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check if key exists on mount (localStorage or env)
    const localKey = localStorage.getItem('gemini_api_key');
    const envKey = process.env.API_KEY;
    
    setHasKey(!!localKey || !!envKey);
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
        // Simple test call to verify validity
        await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: "Ping" }] }],
        });
        setVerifyStatus('valid');
    } catch (e: any) {
        console.error("API Verification Failed:", e);
        setVerifyStatus('invalid');
        setErrorMessage("Invalid API Key. Please check the key and try again.");
    } finally {
        setVerifying(false);
    }
  };

  const saveAndClose = () => {
      localStorage.setItem('gemini_api_key', inputKey);
      setHasKey(true);
      setShowDialog(false);
      setVerifyStatus('idle');
  };

  const clearKey = () => {
      localStorage.removeItem('gemini_api_key');
      setInputKey('');
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
            title={hasKey ? "Configure API Key" : "Set API Key"}
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
                <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md m-4 overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Key size={18} className="text-blue-600"/> API Key Configuration
                        </h3>
                        <button onClick={() => setShowDialog(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <div className="text-sm text-slate-600 leading-relaxed">
                            To access AI features, please provide your Google Gemini API Key. 
                            The key is stored locally in your browser's storage.
                        </div>
                        
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
                                    {verifying ? <Loader2 size={16} className="animate-spin text-blue-500"/> : 
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

                        <div className="flex items-center justify-between pt-1">
                             <a 
                                href="https://aistudio.google.com/app/apikey" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-medium"
                             >
                                Get API Key <ExternalLink size={10} />
                             </a>
                             
                             {inputKey && (
                                 <button onClick={clearKey} className="text-xs text-slate-400 hover:text-red-600 transition-colors">
                                     Clear Key
                                 </button>
                             )}
                        </div>
                    </div>

                    <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <button 
                            onClick={verifyKey}
                            disabled={verifying || !inputKey}
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-slate-200 transition-all disabled:opacity-50 shadow-sm"
                        >
                            Verify
                        </button>
                        <button 
                            onClick={saveAndClose}
                            disabled={verifyStatus !== 'valid'}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                        >
                            <Save size={16} /> Save Key
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};
