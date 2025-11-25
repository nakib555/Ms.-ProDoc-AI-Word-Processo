
import React from 'react';
import { RibbonSeparator } from '../../common/RibbonSeparator';

// Groups
import { ProofingGroup } from './proofing/ProofingGroup';
import { SpeechGroup } from './speech/SpeechGroup';
import { AccessibilityGroup } from './accessibility/AccessibilityGroup';
import { LanguageGroup } from './language/LanguageGroup';
import { CommentsGroup } from './comments/CommentsGroup';
import { TrackingGroup } from './tracking/TrackingGroup';
import { ChangesGroup } from './changes/ChangesGroup';
import { CompareGroup } from './compare/CompareGroup';
import { ProtectGroup } from './protect/ProtectGroup';
import { InkGroup } from './ink/InkGroup';

export const ReviewTab: React.FC = () => {
  return (
    <>
      <ProofingGroup />
      <RibbonSeparator />
      <SpeechGroup />
      <RibbonSeparator />
      <AccessibilityGroup />
      <RibbonSeparator />
      <LanguageGroup />
      <RibbonSeparator />
      <CommentsGroup />
      <RibbonSeparator />
      <TrackingGroup />
      <RibbonSeparator />
      <ChangesGroup />
      <RibbonSeparator />
      <CompareGroup />
      <RibbonSeparator />
      <ProtectGroup />
      <RibbonSeparator />
      <InkGroup />
    </>
  );
};
