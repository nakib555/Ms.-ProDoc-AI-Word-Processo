import React from 'react';
import { Printer } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useFileTab } from '../FileTabContext';

export const PrintTool: React.FC = () => {
  const { setActiveModal } = useFileTab();
  return <RibbonButton icon={Printer} label="Print" onClick={() => setActiveModal('print')} />;
};