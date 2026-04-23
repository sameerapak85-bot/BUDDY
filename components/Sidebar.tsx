import React, { useRef } from 'react';
import type { Document } from '../types';
import { BookIcon, CheckCircleIcon, ClockIcon, ExclamationIcon, UploadIcon, XIcon, ExternalLinkIcon } from './icons';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  documents: Document[];
  onUpload: (file: File) => void;
}

const getStatusIcon = (status: Document['status']) => {
  switch (status) {
    case 'ready':
      return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    case 'processing':
      return <ClockIcon className="w-4 h-4 text-yellow-500 animate-spin" />;
    case 'error':
      return <ExclamationIcon className="w-4 h-4 text-red-500" />;
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, documents, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    // Reset input value to allow uploading the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      ></div>
      <aside className={`flex-shrink-0 w-80 bg-slate-950/70 backdrop-blur-lg border-r border-slate-800 flex flex-col fixed md:relative inset-y-0 left-0 z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-200">Knowledge Base</h2>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-slate-500 hover:text-white" aria-label="Close sidebar">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {documents.map((doc, index) => {
            const content = (
              <>
                <BookIcon className="w-5 h-5 mt-1 text-slate-500 flex-shrink-0" />
                <div className="ml-3 flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-slate-300 break-words flex items-center">
                    <span className="truncate">{doc.name}</span>
                    {doc.url && <ExternalLinkIcon className="w-4 h-4 ml-2 text-slate-500 group-hover:text-slate-400 transition-colors flex-shrink-0" />}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                    {getStatusIcon(doc.status)}
                    <span className="capitalize">{doc.status}</span>
                    <span>&middot;</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
              </>
            );

            if (doc.url) {
              return (
                <a
                  key={`${doc.name}-${index}`}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start p-2 rounded-md bg-slate-800/50 hover:bg-slate-800 transition-colors group"
                >
                  {content}
                </a>
              );
            }

            return (
              <div key={`${doc.name}-${index}`} className="flex items-start p-2 rounded-md bg-slate-800/50 hover:bg-slate-800 transition-colors group">
                {content}
              </div>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-slate-800">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden"
            aria-hidden="true"
          />
          <button 
            onClick={handleUploadClick}
            className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500"
          >
            <UploadIcon className="w-5 h-5 mr-2" />
            Upload Document
          </button>
          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter leading-tight">
              Developed by
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Maj DLDK Sameera Lsc CES
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
