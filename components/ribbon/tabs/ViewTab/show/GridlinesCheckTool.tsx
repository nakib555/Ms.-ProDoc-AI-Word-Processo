
import React from 'react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { CheckboxItem } from '../common/ViewTools';

export const GridlinesCheckTool: React.FC = () => {
  const { pageConfig, setPageConfig } = useEditor();
  
  const toggleGrid = () => {
     setPageConfig(prev => ({
       ...prev,
       background: prev.background === 'grid' ? 'none' : 'grid'
     }));
  };

  return (
    <CheckboxItem label="Gridlines" checked={pageConfig.background === 'grid'} onChange={toggleGrid} />
  );
};
