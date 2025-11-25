
import React from 'react';
import { RibbonSeparator } from '../../common/RibbonSeparator';
import { HomeTabProvider } from './HomeTabContext';

// Groups
import { ClipboardGroup } from './clipboard/ClipboardGroup';
import { FontGroup } from './font/FontGroup';
import { ParagraphGroup } from './paragraph/ParagraphGroup';
import { StylesGroup } from './styles/StylesGroup';
import { EditingGroup } from './editing/EditingGroup';
import { VoiceGroup } from './voice/VoiceGroup';

export const HomeTab: React.FC = () => {
  return (
    <HomeTabProvider>
       <ClipboardGroup />
       <RibbonSeparator />
       <FontGroup />
       <RibbonSeparator />
       <ParagraphGroup />
       <RibbonSeparator />
       <StylesGroup />
       <RibbonSeparator />
       <EditingGroup />
       <RibbonSeparator />
       <VoiceGroup />
    </HomeTabProvider>
  );
};
