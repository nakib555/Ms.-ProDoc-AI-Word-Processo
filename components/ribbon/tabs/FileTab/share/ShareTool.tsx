import React from 'react';
import { Share2 } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useFileTab } from '../FileTabContext';

export const ShareTool: React.FC = () => {
  const { setActiveModal } = useFileTab();
  return <RibbonButton icon={Share2} label="Share" onClick={() => setActiveModal('share')} />;
};