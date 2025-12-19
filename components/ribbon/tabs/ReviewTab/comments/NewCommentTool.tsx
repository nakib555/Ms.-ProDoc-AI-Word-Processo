
import React from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';

export const NewCommentTool: React.FC = () => (
    <RibbonButton 
        icon={MessageSquarePlus} 
        label="New Comment" 
        onClick={() => document.execCommand('insertHTML', false, '<span style="background:#fef08a; border-bottom:2px solid #eab308;" title="Comment">[Comment]</span>')} 
        iconClassName="text-violet-600 dark:text-violet-400"
    />
);
