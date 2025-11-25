import React from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useDrawTab } from '../DrawTabContext';

export type PenType = 'pen' | 'pencil' | 'highlighter' | 'galaxy';

export interface PenConfig {
    id: string;
    type: PenType;
    label: string;
    colors: {
        body: string;
        accent: string;
        tip: string;
    };
}

interface PenToolProps {
    config: PenConfig;
}

export const PenTool: React.FC<PenToolProps> = React.memo(({ config }) => {
    const { activeTool, setActiveTool } = useDrawTab();
    const isActive = activeTool === config.id;
    const { type, colors, label } = config;

    // Helper for gradient styles
    const getBodyStyle = () => {
        return colors.body.includes('gradient') 
            ? { backgroundImage: colors.body } 
            : { backgroundColor: colors.body };
    };

    const renderPenContent = () => {
        switch (type) {
            case 'pencil':
                return (
                    <div className="flex flex-col items-center w-full h-full relative">
                        {/* Eraser */}
                        <div className="w-full h-3 bg-rose-300 rounded-t-[3px] border-x border-t border-rose-400 relative overflow-hidden">
                             <div className="absolute inset-0 bg-white/10 skew-x-12"></div>
                        </div>
                        {/* Ferrule */}
                        <div className="w-full h-2 bg-slate-300 border-x border-slate-400 flex flex-col justify-evenly px-[1px]">
                             <div className="w-full h-[1px] bg-slate-400/50"></div>
                             <div className="w-full h-[1px] bg-slate-400/50"></div>
                        </div>
                        {/* Body */}
                        <div className="w-full flex-1 bg-amber-200 border-x border-amber-300 relative flex justify-center">
                            <div className="w-[1px] h-full bg-amber-600/10 mr-1"></div>
                            <div className="w-[1px] h-full bg-amber-600/10 ml-1"></div>
                        </div>
                        {/* Tip */}
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-700 filter drop-shadow-sm mt-[-1px]"></div>
                    </div>
                );
            case 'highlighter':
                 return (
                    <div className="flex flex-col items-center w-full h-full relative">
                        {/* Cap */}
                        <div className="w-full h-8 rounded-t-[2px] border-x border-t relative shadow-sm" style={{ ...getBodyStyle(), borderColor: colors.accent }}>
                            <div className="absolute top-1 right-1 w-[2px] h-4 bg-black/10 rounded-full"></div>
                        </div>
                        {/* Body separation */}
                        <div className="w-[90%] h-[1px] bg-black/10 my-[1px]"></div>
                        {/* Body Base */}
                        <div className="w-full flex-1 border-x" style={{ ...getBodyStyle(), borderColor: colors.accent }}></div>
                        {/* Tip (Chisel) */}
                        <div className="w-full h-2 rounded-b-[2px] mb-[2px]" style={{ backgroundColor: colors.tip }}></div>
                    </div>
                 );
            case 'galaxy':
                 return (
                    <div className="flex flex-col items-center w-full h-full relative">
                        <div className="w-full flex-1 rounded-t-[3px] border-x border-t border-indigo-900/30 relative overflow-hidden shadow-sm" style={getBodyStyle()}>
                             <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-white/20 to-transparent"></div>
                             <Sparkles size={8} className="absolute top-2 left-0.5 text-white animate-pulse" />
                             <Sparkles size={6} className="absolute bottom-6 right-0.5 text-white/80 animate-pulse delay-100" />
                        </div>
                         <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] mt-[1px]" style={{ borderTopColor: colors.tip }}></div>
                    </div>
                 );
            default: // Standard Pen
                return (
                    <div className="flex flex-col items-center w-full h-full relative">
                         {/* Cap */}
                         <div className="w-full h-10 rounded-t-[3px] border-x border-t relative shadow-sm" style={{ ...getBodyStyle(), borderColor: colors.accent }}>
                             {/* Clip */}
                             <div className="absolute top-0 right-[3px] w-[3px] h-6 bg-slate-400/30 rounded-b-sm border-x border-b border-white/10"></div>
                             {/* Shine */}
                             <div className="absolute top-1 left-[2px] w-[2px] h-8 bg-white/20 rounded-full blur-[0.5px]"></div>
                         </div>
                         {/* Collar */}
                         <div className="w-full h-1 bg-slate-300 border-x border-slate-400"></div>
                         {/* Tip */}
                         <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] mt-[1px]" style={{ borderTopColor: colors.tip }}></div>
                    </div>
                );
        }
    };

    const widthClass = type === 'highlighter' ? 'w-5' : 'w-3.5';

    return (
        <button 
            onClick={() => setActiveTool(config.id)}
            className={`
                group relative flex flex-col items-center justify-center h-full px-1.5 py-1 transition-all duration-300 ease-out outline-none
                ${isActive ? '-translate-y-2' : 'translate-y-0 hover:-translate-y-1'}
            `}
            title={label}
        >
            {/* Pen Body */}
            <div className={`${widthClass} h-12 relative transition-transform duration-200 group-active:scale-95`}>
                {renderPenContent()}
            </div>
            
            {/* Selection Indicator / Arrow */}
            <div className={`
                absolute bottom-0 left-1/2 -translate-x-1/2 transition-all duration-200
                ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}
            `}>
                <ChevronDown size={10} className="text-slate-500" strokeWidth={2.5} />
            </div>
            
            {/* Active Glow/Shadow underlying */}
            {isActive && (
                <div className="absolute bottom-2 w-full h-1 bg-black/20 rounded-full blur-sm -z-10"></div>
            )}
        </button>
    );
});