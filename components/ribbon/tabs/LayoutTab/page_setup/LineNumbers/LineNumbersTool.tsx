
import React, { useState, Suspense } from 'react';
import { ListOrdered } from 'lucide-react';
import { RibbonButton } from '../../../../common/RibbonButton';
import { useEditor } from '../../../../../../contexts/EditorContext';
import { PageConfig } from '../../../../../../types';

const PageSetupDialog = React.lazy(() => import('./LineNumberingOptions/PageSetupDialog').then(m => ({ default: m.PageSetupDialog })));

export const LineNumbersTool: React.FC = () => {
  const { setPageConfig, pageConfig } = useEditor();
  const [showDialog, setShowDialog] = useState(false);

  const handleSave = (newConfig: PageConfig) => {
      setPageConfig(newConfig);
      setShowDialog(false);
  };

  return (
    <>
        <RibbonButton 
            icon={ListOrdered} 
            label="Line Numbers" 
            onClick={() => setShowDialog(true)} 
            hasArrow 
        />
        {showDialog && (
             <Suspense fallback={null}>
                <PageSetupDialog 
                    isOpen={showDialog}
                    onClose={() => setShowDialog(false)}
                    config={pageConfig}
                    onSave={handleSave}
                />
             </Suspense>
         )}
    </>
  );
};
