import React from 'react';
import { Info } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useFileTab } from '../FileTabContext';

export const InfoTool: React.FC = () => {
  const { setActiveModal } = useFileTab();
  return <RibbonButton icon={Info} label="Info" onClick={() => setActiveModal('info')} />;
};