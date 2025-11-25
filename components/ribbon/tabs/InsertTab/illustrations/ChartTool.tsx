
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { SmallRibbonButton } from '../common/InsertTools';

export const ChartTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const insertChart = () => {
      const chartUrl = "https://quickchart.io/chart?c={type:'bar',data:{labels:['Q1','Q2','Q3','Q4'],datasets:[{label:'Revenue',data:[120,150,180,240],backgroundColor:'rgba(59,130,246,0.5)'}]}}";
      executeCommand('insertImage', chartUrl);
  };
  return <SmallRibbonButton icon={BarChart3} label="Chart" onClick={insertChart} />;
};
