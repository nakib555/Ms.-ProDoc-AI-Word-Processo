import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { ApiKeyTool } from './ApiKeyTool';

export const SettingsGroup: React.FC = () => {
  return (
    <RibbonSection title="Settings">
       <ApiKeyTool />
    </RibbonSection>
  );
};