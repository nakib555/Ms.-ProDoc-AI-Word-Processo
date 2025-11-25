
import React from 'react';
import { RibbonSeparator } from '../../common/RibbonSeparator';

// Groups
import { CreateGroup } from './create/CreateGroup';
import { StartMailMergeGroup } from './start_mail_merge/StartMailMergeGroup';
import { WriteInsertFieldsGroup } from './write_insert_fields/WriteInsertFieldsGroup';
import { PreviewResultsGroup } from './preview_results/PreviewResultsGroup';
import { FinishGroup } from './finish/FinishGroup';

export const MailingsTab: React.FC = () => {
  return (
    <>
      <CreateGroup />
      <RibbonSeparator />
      <StartMailMergeGroup />
      <RibbonSeparator />
      <WriteInsertFieldsGroup />
      <RibbonSeparator />
      <PreviewResultsGroup />
      <RibbonSeparator />
      <FinishGroup />
    </>
  );
};
