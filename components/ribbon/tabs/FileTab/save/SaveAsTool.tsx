import React from 'react';
import { Copy } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useFileTab } from '../FileTabContext';

export const SaveAsTool: React.FC = () => {
  const { setActiveModal } = useFileTab();
  return <RibbonButton icon={Copy} label="Save As" onClick={() => setActiveModal('save_as')} />;
};