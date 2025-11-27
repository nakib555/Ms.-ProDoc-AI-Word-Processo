
import React from 'react';
import { useEquationTab } from '../../EquationTabContext';

export const UnicodeTool: React.FC = () => {
  const { conversionType, setConversionType } = useEquationTab();
  
  return (
    <button 
        className="flex items-center gap-1.5 text-[11px] cursor-pointer rounded px-1 py-0.5 group"
        onClick={() => setConversionType('unicode')}
    >
        <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-colors ${conversionType === 'unicode' ? 'border-blue-600 bg-blue-600' : 'border-slate-400 bg-white group-hover:border-blue-400'}`}>
            {conversionType === 'unicode' && <div className="w-1 h-1 bg-white rounded-full"></div>}
        </div>
        <span className="text-slate-700 dark:text-slate-300">Unicode</span>
    </button>
  );
};
