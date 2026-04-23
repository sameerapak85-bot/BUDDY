
import React, { useRef, useEffect } from 'react';
import type { Message } from '../types';
import { MessageItem } from './Message';
import { ShieldIcon, ClockIcon } from './icons';

interface ChatWindowProps {
  messages: Message[];
  isSearching: boolean;
}

const SearchingIndicator: React.FC = () => (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 ring-1 ring-slate-700">
        <ShieldIcon className="w-5 h-5 text-cyan-400" />
      </div>
      <div className="p-3 rounded-lg max-w-lg bg-slate-800 text-slate-400 italic">
        <p className="text-sm flex items-center">
          <ClockIcon className="w-4 h-4 mr-2 text-yellow-500 animate-spin" />
          <span>Analyzing 'Strategic Doctrine.pdf'...</span>
        </p>
      </div>
    </div>
);


export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isSearching }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSearching]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {messages.map((msg, index) => (
        <MessageItem key={index} message={msg} />
      ))}
      {isSearching && <SearchingIndicator />}
    </div>
  );
};
