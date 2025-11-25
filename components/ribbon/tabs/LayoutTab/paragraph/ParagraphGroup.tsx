
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { IndentTools } from './IndentTools';
import { SpacingTools } from './SpacingTools';
import { Settings } from 'lucide-react';

export const ParagraphGroup: React.FC = () => {
  return (
    <RibbonSection title="Paragraph">
        <div className="flex h-full gap-4 px-2">
             <IndentTools />
             <div className="w-[1px] bg-slate-200 h-full"></div>
             <SpacingTools />
        </div>
        {/* Launcher */}
        <button className="absolute bottom-1 right-1 p-0.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-sm">
            <Settings size={10} />
        </button>
    </RibbonSection>
  );
};
