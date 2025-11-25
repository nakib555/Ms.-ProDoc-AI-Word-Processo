import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { PenTool, PenConfig } from './PenTool';
import { AddPenTool } from './AddPenTool';

const PEN_CONFIGS: PenConfig[] = [
    { id: 'pen_black', type: 'pen', label: 'Black Pen', colors: { body: '#0f172a', accent: '#334155', tip: '#0f172a' } },
    { id: 'pen_red', type: 'pen', label: 'Red Pen', colors: { body: '#dc2626', accent: '#991b1b', tip: '#dc2626' } },
    { id: 'pencil', type: 'pencil', label: 'Pencil', colors: { body: '#e2e8f0', accent: '#94a3b8', tip: '#64748b' } },
    { id: 'highlighter', type: 'highlighter', label: 'Highlighter', colors: { body: '#facc15', accent: '#eab308', tip: '#facc15' } },
    { id: 'pen_blue', type: 'pen', label: 'Blue Pen', colors: { body: '#2563eb', accent: '#1d4ed8', tip: '#2563eb' } },
    { id: 'pen_galaxy', type: 'galaxy', label: 'Galaxy Pen', colors: { body: 'linear-gradient(135deg, #6366f1, #d946ef)', accent: '#4338ca', tip: '#6366f1' } },
];

export const PensGroup: React.FC = () => {
  return (
    <RibbonSection title="Pens">
         <div className="flex h-full items-center gap-1 px-1">
             {PEN_CONFIGS.map(pen => (
                 <PenTool 
                    key={pen.id}
                    config={pen}
                 />
             ))}
             <AddPenTool />
         </div>
    </RibbonSection>
  );
};