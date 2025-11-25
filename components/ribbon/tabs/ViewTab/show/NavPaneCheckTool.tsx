
import React from 'react';
import { CheckboxItem } from '../common/ViewTools';
import { useViewTab } from '../ViewTabContext';

export const NavPaneCheckTool: React.FC = () => {
  const { showNavPane, setShowNavPane } = useViewTab();
  return (
    <CheckboxItem label="Navigation Pane" checked={showNavPane} onChange={() => setShowNavPane(!showNavPane)} />
  );
};
