
import React from 'react';
import { FileSearch } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const EditorTool: React.FC = () => (
    <RibbonButton 
        icon={FileSearch} 
        label="Editor" 
        onClick={() => alert("Editor Score: 100%")} 
        title="Editor"
    />
);
