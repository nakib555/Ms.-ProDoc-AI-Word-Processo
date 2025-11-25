
import React from 'react';
import { ListOrdered } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const LineNumbersTool: React.FC = () => {
  return (
    <RibbonButton icon={ListOrdered} label="Line Numbers" onClick={() => {}} hasArrow />
  );
};
