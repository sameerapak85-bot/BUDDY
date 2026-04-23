
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import type { Message, Document } from './types';
import { Role } from './types';
import { streamMessage } from './services/geminiService';
import { MenuIcon, XIcon } from './components/icons';
import { extractTextFromPdf } from './services/pdfService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: Role.AI,
      content: '### SYSTEM READY\nWelcome to **BUDDY**, your tactical intelligence companion. \n\nPlease upload a PDF document to begin tactical analysis and doctrine extraction. Secure connection established.',
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  const chatInstanceRef = useRef<any>(null);
  const isFirstChunkRef = useRef(true);

  // Computed context from all ready documents
  const documentContext = documents
    .filter(doc => doc.status === 'ready' && doc.content)
    .map(doc => `--- DOCUMENT: ${doc.name} ---\n${doc.content}`)
    .join('\n\n');

  const handleSendMessage = useCallback(async (text: string) => {
    setIsLoading(true);
    setIsSearching(true);
    setError(null);
    const userMessage: Message = { role: Role.USER, content: text };
    setMessages(prev => [...prev, userMessage]);
    isFirstChunkRef.current = true; // Reset for new message stream

    const updateStream = (chunk: string) => {
        if (isFirstChunkRef.current) {
            setIsSearching(false);
            isFirstChunkRef.current = false;
            // First chunk, create the AI message
            setMessages(prev => [...prev, { role: Role.AI, content: chunk }]);
        } else {
            // Subsequent chunks, append to the last AI message
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage.role === Role.AI) {
                    const updatedLastMessage = { ...lastMessage, content: lastMessage.content + chunk };
                    return [...prev.slice(0, -1), updatedLastMessage];
                }
                return prev;
            });
        }
    };

    const handleError = (err: Error) => {
        console.error(err);
        setError('An error occurred while communicating with the AI. Please check the console.');
        setIsSearching(false);
    };

    const handleFinally = () => {
        setIsLoading(false);
        setIsSearching(false);
    };

    try {
      // Pass the current messages as history (excluding the very last user message just added if necessary, 
      // but streamMessage implementation handles it by creating a new session if context changes)
      // Actually, we pass the messages BEFORE the current one as history.
      const history = messages; 
      await streamMessage(text, chatInstanceRef, updateStream, handleError, handleFinally, documentContext, history);
    } catch (e) {
      handleError(e as Error);
      handleFinally();
    }

  }, [documentContext, messages]);

  const handleUploadDocument = async (file: File) => {
    const newDocument: Document = {
      name: file.name,
      status: 'processing',
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    };
    setDocuments(prev => [newDocument, ...prev]);
    // Reset chat instance to force system instruction update with new document context
    chatInstanceRef.current = null;

    try {
      const text = await extractTextFromPdf(file);
      setDocuments(prev => prev.map(doc => 
        doc.name === newDocument.name ? { ...doc, status: 'ready', content: text } : doc
      ));
      
      // Add a system message informing the user the document is ready
      setMessages(prev => [...prev, { 
        role: Role.AI, 
        content: `### ANALYSIS COMPLETE\nDocument **"${file.name}"** has been successfully ingested and processed. Ready for tactical inquiry regarding this asset.` 
      }]);
    } catch (err) {
      console.error('PDF extraction failed:', err);
      setDocuments(prev => prev.map(doc => 
        doc.name === newDocument.name ? { ...doc, status: 'error' } : doc
      ));
      setError(`Failed to extract text from "${file.name}". Please ensure it is a valid PDF.`);
    }
  };


  return (
    <div className="flex h-screen w-screen bg-slate-900 font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setSidebarOpen} 
        documents={documents}
        onUpload={handleUploadDocument}
      />
      
      <main className="flex-1 flex flex-col h-screen transition-all duration-300">
        <header className="flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
            <h1 className="text-lg font-semibold ml-2 text-slate-100 uppercase tracking-wider">BUDDY</h1>
            <span className="ml-3 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-900 rounded-sm leading-none flex items-center">
              TEST VERSION
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Encrypted Connection</span>
          </div>
        </header>

        <ChatWindow messages={messages} isSearching={isSearching} />
        
        {error && <div className="p-4 text-center text-red-400 bg-red-900/50">{error}</div>}

        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default App;
