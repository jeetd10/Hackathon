// components/ChatBox.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Trash2, Sparkles } from 'lucide-react';

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function ChatBox({ isOpen, onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetch('/api/chat')
        .then(res => res.json())
        .then(data => {
          if (data.history?.length > 0) {
            setMessages(data.history.map((m: any) => ({
              role: m.role,
              text: m.content
            })));
          } else {
             setMessages([{ role: 'model', text: 'System Online. How can I assist with your cognitive process today?' }]);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'Diagnostic error: Unable to connect to LLM core.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      if (confirm("Execute history wipe?")) {
        await fetch('/api/chat', { method: 'DELETE' });
        setMessages([{ role: 'model', text: 'Memory wiped. System ready.' }]);
      }
    } catch(e) { }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Chat Panel */}
          <motion.div
            className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-[calc(100%-48px)] sm:w-[420px] h-[650px] max-h-[calc(100vh-80px)] glass z-50 rounded-2xl flex flex-col shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-[8px] bg-electric-blue flex items-center justify-center">
                  <Bot className="size-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white tracking-tight text-[15px] leading-tight">Aura Assistant</h3>
                  <p className="text-[10px] text-emerald-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                    <span className="relative flex size-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500"></span>
                    </span>
                    Connected
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={clearHistory} className="p-2 hover:bg-white/10 rounded-md text-white/40 hover:text-red-400 transition-colors" title="Wipe History">
                   <Trash2 className="size-4" />
                 </button>
                 <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-colors">
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-6 space-y-5 scrollbar-thin">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`size-7 rounded-[6px] shrink-0 flex items-center justify-center border ${msg.role === 'user' ? 'bg-white/5 border-white/10' : 'bg-electric-blue/10 border-electric-blue/20'}`}>
                    {msg.role === 'user' ? <User className="size-3.5 text-white/70" /> : <Bot className="size-3.5 text-[#D6A08A]" />}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-[10px] p-3 text-[13px] leading-relaxed font-light ${
                      msg.role === 'user'
                        ? 'bg-white/10 border border-white/5 text-white'
                        : 'bg-transparent border border-white/5 text-white/90'
                    }`}
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="size-7 rounded-[6px] shrink-0 flex items-center justify-center border bg-electric-blue/10 border-electric-blue/20">
                    <Bot className="size-3.5 text-[#D6A08A]" />
                  </div>
                  <div className="bg-transparent border border-white/5 rounded-[10px] p-4 flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-[#D6A08A] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="size-1.5 rounded-full bg-[#D6A08A] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="size-1.5 rounded-full bg-[#D6A08A] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white/[0.02] border-t border-white/5">
              <div className="relative flex items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Input query..."
                  rows={Math.min(4, input.split('\n').length || 1)}
                  className="w-full input-glow rounded-xl pl-4 pr-12 py-3.5 text-[13px] text-white placeholder:text-white/30 resize-none font-light block"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 bottom-2 size-9 rounded-[8px] bg-white text-black flex items-center justify-center disabled:opacity-30 disabled:scale-100 transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="size-4 -ml-0.5" />
                </button>
              </div>
              <p className="text-center text-[10px] text-white/20 mt-3 flex items-center justify-center gap-1 uppercase tracking-widest">
                <Sparkles className="size-3" /> Powered by Gemini
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}