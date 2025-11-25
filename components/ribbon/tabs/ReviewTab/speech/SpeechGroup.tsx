
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { ReadAloudTool } from './ReadAloudTool';

export const SpeechGroup: React.FC = () => {
  return (
    <RibbonSection title="Speech">
        <ReadAloudTool />
    </RibbonSection>
  );
};
