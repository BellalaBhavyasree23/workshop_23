
import React from 'react';
import { Message, Role } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg
          ${isUser ? 'ml-3 bg-indigo-600' : 'mr-3 bg-slate-700'}`}>
          {isUser ? 'ME' : 'AI'}
        </div>

        {/* Bubble */}
        <div className={`relative px-4 py-3 rounded-2xl shadow-sm border
          ${isUser 
            ? 'bg-indigo-700 border-indigo-500 rounded-tr-none text-white' 
            : 'bg-slate-800 border-slate-700 rounded-tl-none text-slate-100'}`}>
          
          <MarkdownRenderer content={message.text} />
          
          {message.groundingSources && message.groundingSources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-600/50">
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Sources</p>
              <div className="flex flex-wrap gap-2">
                {message.groundingSources.map((source, idx) => (
                  <a 
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-slate-900/50 hover:bg-slate-900 px-2 py-1 rounded border border-slate-700 text-indigo-300 transition-colors"
                  >
                    {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {message.isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse align-middle"></span>
          )}

          <div className={`text-[10px] mt-1 opacity-40 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
