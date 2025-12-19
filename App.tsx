
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Role, Message, GroundingSource } from './types';
import { createChatSession, parseGroundingChunks } from './services/gemini';
import ChatMessage from './components/ChatMessage';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat session once
  useEffect(() => {
    try {
      chatSessionRef.current = createChatSession();
      // Add initial greeting
      const greeting: Message = {
        id: 'initial-greeting',
        role: Role.MODEL,
        text: "Hello! I am OmniChat. I can answer questions about history, science, coding, recent news, or anything else you're curious about. How can I help you today?",
        timestamp: new Date(),
      };
      setMessages([greeting]);
    } catch (err) {
      setError("Failed to initialize chat session. Please check your configuration.");
      console.error(err);
    }
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    // Placeholder for AI response
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessagePlaceholder: Message = {
      id: aiMessageId,
      role: Role.MODEL,
      text: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    
    setMessages(prev => [...prev, aiMessagePlaceholder]);

    try {
      if (!chatSessionRef.current) {
        chatSessionRef.current = createChatSession();
      }

      const stream = await chatSessionRef.current.sendMessageStream({ message: inputText });
      
      let fullText = '';
      let sources: GroundingSource[] = [];

      for await (const chunk of stream) {
        const textPart = chunk.text || '';
        fullText += textPart;
        
        // Try to extract grounding sources if available in chunks
        const newSources = parseGroundingChunks(chunk);
        if (newSources.length > 0) {
          sources = [...sources, ...newSources];
        }

        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, text: fullText, groundingSources: sources.length > 0 ? sources : undefined } 
              : msg
          )
        );
      }

      // Final update to clear streaming state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (err: any) {
      console.error("Chat error:", err);
      setError("An error occurred while getting the response. Please try again.");
      setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 flex items-center justify-between z-10 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">OmniChat</h1>
            <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold opacity-80">Universal AI Assistant</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs text-slate-400 font-medium">Gemini 3 Pro Powered</span>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="sticky bottom-4 left-0 right-0 max-w-lg mx-auto bg-red-900/40 border border-red-500/50 backdrop-blur-md text-red-200 px-4 py-3 rounded-lg text-sm flex items-center shadow-2xl z-20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </main>

      {/* Input Section */}
      <footer className="flex-shrink-0 p-4 bg-slate-800/80 backdrop-blur-xl border-t border-slate-700 shadow-2xl">
        <div className="max-w-4xl mx-auto relative">
          <form onSubmit={handleSendMessage} className="relative group">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder="Ask anything... (e.g., Explain quantum physics or What's the latest news?)"
              className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 pl-5 pr-14 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-xl transition-all duration-300
                ${inputText.trim() && !isLoading 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
          </form>
          <p className="mt-2 text-center text-[10px] text-slate-500 font-medium">
            OmniChat can provide accurate information using Google Search. Please verify sensitive facts.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
