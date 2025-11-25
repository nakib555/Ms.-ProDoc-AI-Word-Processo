
import React, { useState } from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';

export const StyleActions: React.FC = () => {
  const { addCustomStyle } = useEditor();
  const [showStyleDialog, setShowStyleDialog] = useState(false);
  const [newStyleName, setNewStyleName] = useState('');

  const handleCreateStyle = () => {
    if (newStyleName.trim()) {
        addCustomStyle(newStyleName);
        setNewStyleName('');
        setShowStyleDialog(false);
    }
  };

  return (
    <>
        <div className="flex flex-col gap-1 h-full border-l border-slate-200 pl-1">
             <button 
                className="h-6 w-6 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 rounded-sm transition-colors"
                title="Create New Style"
                onClick={() => setShowStyleDialog(true)}
             >
                <Plus size={12} />
             </button>
             <button className="h-6 w-6 flex items-center justify-center hover:bg-slate-100 rounded-sm">
                <MoreHorizontal size={12} className="text-slate-500" />
             </button>
        </div>

        {/* Create Style Dialog */}
        {showStyleDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white p-6 rounded-xl shadow-2xl w-80 animate-in zoom-in-95 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Create New Style</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
                        <input 
                            type="text" 
                            value={newStyleName}
                            onChange={(e) => setNewStyleName(e.target.value)}
                            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="My Custom Style"
                            autoFocus
                        />
                    </div>
                    <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-500">
                        This will save the current font, size, color, and style properties of your selection as a reusable style.
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={() => setShowStyleDialog(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-md transition-colors">Cancel</button>
                        <button onClick={handleCreateStyle} className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors">Create</button>
                    </div>
                </div>
             </div>
        </div>
        )}
    </>
  );
};
