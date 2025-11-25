
import React from 'react';
import { TableOfContents } from 'lucide-react';
import { DropdownRibbonButton } from '../common/ReferencesTools';
import { MenuPortal } from '../../../common/MenuPortal';
import { useReferencesTab } from '../ReferencesTabContext';
import { useEditor } from '../../../../../contexts/EditorContext';

export const TableOfContentsTool: React.FC = () => {
  const { activeMenu, menuPos, closeMenu } = useReferencesTab();
  const { executeCommand } = useEditor();
  const menuId = 'toc';

  const insertTOC = () => {
      executeCommand('insertHTML', `
        <div class="toc-container" style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; margin: 20px 0;">
            <h3 style="margin-top: 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px;">Table of Contents</h3>
            <div style="font-family: 'Times New Roman', serif; line-height: 1.6;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #cbd5e1;"><span>1. Introduction</span><span>1</span></div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #cbd5e1; margin-left: 20px;"><span>1.1 Background</span><span>2</span></div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #cbd5e1;"><span>2. Methodology</span><span>5</span></div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #cbd5e1;"><span>3. Results</span><span>12</span></div>
            </div>
        </div>
        <p><br/></p>
      `);
      closeMenu();
  };

  return (
    <>
        <DropdownRibbonButton 
            id={menuId} 
            icon={TableOfContents} 
            label="Table of Contents" 
        />
        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={200}>
             <div className="p-1">
                 <button onClick={insertTOC} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700">Automatic Table 1</button>
                 <button onClick={insertTOC} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700">Automatic Table 2</button>
                 <button onClick={insertTOC} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700">Manual Table</button>
             </div>
        </MenuPortal>
    </>
  );
};
