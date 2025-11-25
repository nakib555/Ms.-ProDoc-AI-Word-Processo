import React from 'react';
import { RibbonSection } from '../../common/RibbonSection';
import { RibbonSeparator } from '../../common/RibbonSeparator';
import { RibbonButton } from '../../common/RibbonButton';
import { PaintBucket, Layout, Table } from 'lucide-react';
import { useEditor } from '../../../../contexts/EditorContext';

// Groups - Inline simplified for brevity in this batch
const TableStylesGroup: React.FC = () => {
  const { applyBlockStyle } = useEditor();
  return (
    <RibbonSection title="Table Styles">
        <div className="grid grid-cols-4 gap-1 p-1 h-full content-center">
            {['#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6'].map(color => (
                <button 
                    key={color}
                    onClick={() => applyBlockStyle({ backgroundColor: color })}
                    className="w-5 h-5 border border-slate-300 hover:border-blue-500 rounded-[1px] transition-all"
                    style={{ backgroundColor: color }}
                    title="Apply Shading"
                />
            ))}
        </div>
    </RibbonSection>
  );
};

const BordersGroup: React.FC = () => {
  const { applyBlockStyle } = useEditor();
  return (
    <RibbonSection title="Borders">
        <RibbonButton 
            icon={Layout} 
            label="All Borders" 
            onClick={() => applyBlockStyle({ border: '1px solid black' })} 
        />
        <RibbonButton 
            icon={Table} 
            label="No Borders" 
            onClick={() => applyBlockStyle({ border: 'none' })} 
        />
    </RibbonSection>
  );
};

const ShadingGroup: React.FC = () => {
    const { applyBlockStyle } = useEditor();
    return (
        <RibbonSection title="Shading">
            <RibbonButton 
                icon={PaintBucket} 
                label="Shading" 
                onClick={() => applyBlockStyle({ backgroundColor: '#fef9c3' })} 
                title="Highlight Cell"
            />
        </RibbonSection>
    );
};

export const TableDesignTab: React.FC = () => {
  return (
    <>
        <TableStylesGroup />
        <RibbonSeparator />
        <BordersGroup />
        <RibbonSeparator />
        <ShadingGroup />
    </>
  );
};