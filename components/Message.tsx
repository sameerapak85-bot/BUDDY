
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../types';
import { Role } from '../types';
import { UserIcon, ShieldIcon } from './icons';

interface MessageProps {
  message: Message;
}

export const MessageItem: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  if (isUser) {
    return (
      <div className="flex items-start gap-3 justify-end">
        <div className="p-3 rounded-lg max-w-lg bg-blue-600 text-white">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-5 h-5 text-slate-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 ring-1 ring-slate-700">
        <ShieldIcon className="w-5 h-5 text-cyan-400" />
      </div>
      <div className="p-3 rounded-lg max-w-lg bg-slate-800 text-slate-200 border border-slate-700/50">
        <div className="markdown-body prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-cyan-400 prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 prose-strong:text-cyan-300 prose-ul:list-disc prose-ul:ml-4 prose-ol:list-decimal prose-ol:ml-4 prose-table:border prose-table:border-slate-700 prose-th:border prose-th:border-slate-700 prose-th:p-2 prose-td:border prose-td:border-slate-700 prose-td:p-2">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
