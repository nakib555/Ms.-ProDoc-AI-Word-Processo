import React from 'react';
import { Mail, Cloud } from 'lucide-react';

export const ShareModal: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="p-6 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group bg-white">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-full w-fit mb-4 group-hover:bg-blue-100 transition-colors">
          <Mail size={24} />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Email</h3>
        <p className="text-sm text-slate-500 mb-4">Send a copy of this document via your default email client.</p>
        <button className="text-sm font-medium text-blue-600 group-hover:underline">Send Email &rarr;</button>
      </div>

      <div className="p-6 border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group bg-white">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-full w-fit mb-4 group-hover:bg-purple-100 transition-colors">
          <Cloud size={24} />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Save to Cloud</h3>
        <p className="text-sm text-slate-500 mb-4">Upload to your cloud storage to collaborate with others.</p>
        <button className="text-sm font-medium text-purple-600 group-hover:underline">Connect Cloud &rarr;</button>
      </div>
    </div>
  );
};