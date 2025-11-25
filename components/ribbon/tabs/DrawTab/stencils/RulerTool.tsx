import React from 'react';
import { Ruler } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';

export const RulerTool: React.FC = () => {
  const { showRuler, setShowRuler } = useEditor();
  
  return (
    <RibbonButton 
       icon={Ruler} 
       label="Ruler" 
       onClick={() => setShowRuler(!showRuler)} 
       className={showRuler ? 'bg-slate-100 text-blue-700' : ''}
    />
  );
};