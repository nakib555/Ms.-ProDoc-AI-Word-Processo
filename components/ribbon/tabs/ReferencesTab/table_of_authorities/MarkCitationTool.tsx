
import React from 'react';
import { Bookmark } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const MarkCitationTool: React.FC = () => (
    <RibbonButton 
      icon={Bookmark} 
      label="Mark Citation" 
      onClick={() => {}} 
      title="Mark Citation (Alt+Shift+I)"
    />
);
