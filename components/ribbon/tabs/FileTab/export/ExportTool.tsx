import React from 'react';
import { Download } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useFileTab } from '../FileTabContext';

export const ExportTool: React.FC = () => {
  const { setActiveModal } = useFileTab();
  // We reuse the 'save_as' modal for export as per original logic, 
  // or we could make a specific 'export' modal if requirements diverge.
  return <RibbonButton icon={Download} label="Export" onClick={() => setActiveModal('save_as')} />;
};