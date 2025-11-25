import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { InkReplayTool } from './InkReplayTool';

export const ReplayGroup: React.FC = () => {
  return (
    <RibbonSection title="Replay">
        <InkReplayTool />
    </RibbonSection>
  );
};