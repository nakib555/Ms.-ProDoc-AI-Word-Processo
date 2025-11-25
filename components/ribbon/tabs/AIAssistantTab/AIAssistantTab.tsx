
import React from 'react';
import { RibbonSeparator } from '../../common/RibbonSeparator';
import { AIAssistantTabProvider } from './AIAssistantTabContext';

// Groups
import { RefineGroup } from './refine/RefineGroup';
import { ToneGroup } from './tone/ToneGroup';
import { DraftGroup } from './draft/DraftGroup';
import { TranslateGroup } from './translate/TranslateGroup';

export const AIAssistantTab: React.FC = () => {
  return (
    <AIAssistantTabProvider>
       <DraftGroup />
       <RibbonSeparator />
       <RefineGroup />
       <RibbonSeparator />
       <ToneGroup />
       <RibbonSeparator />
       <TranslateGroup />
    </AIAssistantTabProvider>
  );
};
