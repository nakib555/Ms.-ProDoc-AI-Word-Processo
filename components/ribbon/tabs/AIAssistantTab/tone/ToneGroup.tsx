
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { ToneTool } from './ToneTool';

export const ToneGroup: React.FC = () => {
  return (
    <RibbonSection title="Tone & Voice">
       <ToneTool />
    </RibbonSection>
  );
};
