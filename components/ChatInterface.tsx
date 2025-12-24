
import React, { useState, useEffect, useRef } from 'react';
import { ActiveChat, ChatMessage } from '../types';
import { Icons } from '../constants';
import BrutalButton from './BrutalButton';

interface Props {
  chat: ActiveChat;
  onBack: () => void;
  onSendMessage: (text: string) => void;
  myPseudo: string;
}

const ChatInterface: React.FC<Props> = ({ chat, onBack, onSendMessage, myPseudo }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat.messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-fb-dark overflow-hidden text-black dark:text-white">
      {/* Header */}
      <div className="brutal-border-b p-5 flex items-center gap-5 bg-brutal-green text-black">
        <button onClick={onBack} className="p-3 brutal-border bg-white brutal-shadow active:shadow-none transition-all">
          <Icons.ArrowLeft />
        </button>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">{chat.participant.pseudo}</h2>
          <span className="text-xs font-bold mono uppercase opacity-80">
            {chat.participant.distance.toFixed(2)}km • PROXIMITÉ
          </span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8f8f8] dark:bg-fb-dark"
        style={{ backgroundImage: 'radial-gradient(currentColor 0.5px, transparent 0.5px)', backgroundSize: '24px 24px', color: 'rgba(0,0,0,0.05)' }}
      >
        <div className="text-center py-4">
          <span className="bg-black dark:bg-gray-800 text-white text-[10px] font-black px-3 py-1 uppercase tracking-[0.2em]">
            SESSION TEMPORAIRE SÉCURISÉE
          </span>
        </div>
        
        {chat.messages.map((msg) => {
          const isMe = msg.senderPseudo === myPseudo;
          const isSystem = msg.senderId === 'system';
          
          if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center italic text-xs mono font-bold opacity-60 text-center uppercase text-black dark:text-white">
                  {msg.text}
                </div>
              );
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[85%] brutal-border p-4 brutal-shadow
                ${isMe ? 'bg-brutal-yellow text-black' : 'bg-white dark:bg-fb-surface text-black dark:text-white'}
              `}>
                <p className="text-base font-bold leading-tight break-words">{msg.text}</p>
                <div className={`mt-2 text-[9px] mono font-black opacity-50 flex justify-between gap-6 border-t pt-1 ${isMe ? 'border-black/20' : 'border-black/10 dark:border-white/10'}`}>
                   <span className="uppercase">{msg.senderPseudo}</span>
                   <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="brutal-border-t p-5 flex gap-3 bg-white dark:bg-fb-surface">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="ÉCRIRE UN MESSAGE..."
          className="flex-1 brutal-border p-4 mono font-black uppercase text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:ring-4 focus:ring-brutal-pink transition-all bg-white dark:bg-fb-dark"
        />
        <BrutalButton onClick={handleSend} variant="secondary" className="px-5">
          <Icons.Send />
        </BrutalButton>
      </div>
    </div>
  );
};

export default ChatInterface;
