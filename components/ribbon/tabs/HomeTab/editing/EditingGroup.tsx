
import React, { useState } from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { useEditor } from '../../../../../contexts/EditorContext';
import { FindReplaceDialog } from '../../../../FindReplaceDialog';
import { FindTool } from './FindTool';
import { ReplaceTool } from './ReplaceTool';
import { SelectTool } from './SelectTool';

export const EditingGroup: React.FC = () => {
  const { editorRef } = useEditor();
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findReplaceMode, setFindReplaceMode] = useState<'find' | 'replace'>('find');

  return (
    <>
        <RibbonSection title="Editing">
             <div className="flex flex-col h-full justify-between py-1">
                <FindTool onClick={() => {
                        setFindReplaceMode('find');
                        setShowFindReplace(true);
                    }} 
                />
                <ReplaceTool onClick={() => {
                        setFindReplaceMode('replace');
                        setShowFindReplace(true);
                    }} 
                />
                <SelectTool />
             </div>
        </RibbonSection>

        <FindReplaceDialog 
            isOpen={showFindReplace} 
            onClose={() => setShowFindReplace(false)} 
            editorRef={editorRef}
            initialMode={findReplaceMode}
        />
    </>
  );
};
