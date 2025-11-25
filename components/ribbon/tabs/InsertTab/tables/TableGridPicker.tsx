
import React, { useState } from 'react';

export const TableGridPicker: React.FC<{ onInsert: (r: number, c: number) => void }> = ({ onInsert }) => {
    const [hover, setHover] = useState({ r: 0, c: 0 });
    return (
        <div className="p-3 bg-slate-50/50 flex flex-col items-center select-none">
            <div className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider w-full px-0.5">Insert Table</div>
            <div 
              className="grid grid-cols-10 gap-0.5 p-1 bg-white rounded border border-slate-200 shadow-sm cursor-crosshair"
              onMouseLeave={() => setHover({ r: 0, c: 0 })}
            >
                {[...Array(10)].map((_, r) => (
                    [...Array(10)].map((_, c) => {
                        const active = r < hover.r && c < hover.c;
                        return (
                            <div
                                key={`${r}-${c}`}
                                className={`w-4 h-4 border rounded-[1px] transition-all duration-75 ${active ? 'bg-blue-100 border-blue-500' : 'bg-white border-slate-200'}`}
                                onMouseEnter={() => setHover({ r: r + 1, c: c + 1 })}
                                onClick={() => onInsert(r + 1, c + 1)}
                            />
                        );
                    })
                ))}
            </div>
            <div className="text-center text-xs font-medium text-slate-700 h-4 mt-2">
                {hover.r > 0 ? `${hover.c} x ${hover.r} Table` : 'Hover to select size'}
            </div>
        </div>
    );
};
