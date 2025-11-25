import React from 'react';
import { FolderOpen } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useFileTab } from '../FileTabContext';

export const OpenTool: React.FC = () => {
  const { setActiveModal } = useFileTab();
  return <RibbonButton icon={FolderOpen} label="Open" onClick={() => setActiveModal('open')} />;
};