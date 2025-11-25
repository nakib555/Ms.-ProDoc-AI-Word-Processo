
import React from 'react';
import { Video } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';

export const OnlineVideoTool: React.FC = () => {
  const { executeCommand } = useEditor();

  const insertVideo = () => {
     const url = prompt("Enter YouTube URL:", "");
     if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
        let videoId = '';
        if (url.includes('watch?v=')) videoId = url.split('watch?v=')[1].split('&')[0];
        else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1];
        
        if (videoId) {
            const html = `<div style="margin: 1em 0;"><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p><br/></p>`;
            executeCommand('insertHTML', html);
        }
     }
  };

  return (
     <RibbonButton 
         icon={Video} 
         label="Online Video" 
         onClick={insertVideo} 
         title="Embed YouTube Video"
     />
  );
};
