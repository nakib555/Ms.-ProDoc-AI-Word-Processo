import React from 'react';
import { FilePlus } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useFileTab } from '../FileTabContext';

export const NewTool: React.FC = () => {
  const { setActiveModal } = useFileTab();
  return <RibbonButton icon={FilePlus} label="New" onClick={() => setActiveModal('new')} />;
};