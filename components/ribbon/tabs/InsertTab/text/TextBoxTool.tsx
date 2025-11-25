
import React from 'react';
import { Type } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useInsertTab } from '../InsertTabContext';
import { DropdownButton } from '../common/InsertTools';
import { MenuPortal } from '../../../common/MenuPortal';

export const TextBoxTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useInsertTab();

  const insertTextBox = () => {
      const html = `<div style="float: right; width: 200px; padding: 15px; background: #f8fafc; border: 1px solid #cbd5e1; margin: 0 0 1em 1em; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <h4 style="margin-top:0; color: #334155; font-size: 0.9em; font-weight: bold; text-transform: uppercase;">Sidebar</h4>
        <p style="font-size: 0.9em; color: #64748b; margin-bottom: 0;">Add your side note content here.</p>
      </div>`;
      executeCommand('insertHTML', html);
  };

  return (
    <>
         <DropdownButton id="textbox_menu" icon={Type} label="Text Box" />
         <MenuPortal id="textbox_menu" activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu}>
            <div className="p-1">
                <button onClick={insertTextBox} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700">Simple Text Box</button>
            </div>
         </MenuPortal>
    </>
  );
};
