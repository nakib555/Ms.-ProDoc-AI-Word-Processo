
import React from 'react';
import { Minus } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const HyphenationTool: React.FC = () => {
  return (
    <RibbonButton icon={Minus} label="Hyphenation" onClick={() => {}} hasArrow />
  );
};
