'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { MessageSquare, Send, Search, User, Sparkles, Phone, Video } from 'lucide-react';

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState('sarah_ai');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'sarah_ai', text: 'Hey! Saw your project launch on DevTrack 2.0. Loved the vector store architecture!' },
    { sender: 'me', text: 'Thanks Sarah! Appreciate the feedback. We compiled the similarity index to WebAssembly for instant client-side execution.' },
    { sender: 'sarah_ai', text: 'That is super clean. Would love to collaborate on the LLM memory integration.' }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessages([...messages, { sender: 'me', text: messageText }]);
    setMessageText('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-5rem)]">
        <div className="h-full rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Chat List (Col 1-4) */}
          <div className="md:col-span-4 border-r border-white/10 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                <span>Messages</span>
              </h2>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <div
                onClick={() => setActiveChat('sarah_ai')}
                className="flex items-center gap-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 p-3 cursor-pointer"
              >
                <img
                  src="https://avatars.githubusercontent.com/u/810438?v=4"
                  alt="Sarah Chen"
                  className="h-10 w-10 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white">Sarah Chen</h4>
                  <p className="text-[11px] text-slate-400 truncate">Would love to collaborate on the LLM...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Conversation (Col 5-12) */}
          <div className="md:col-span-8 flex flex-col justify-between p-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://avatars.githubusercontent.com/u/810438?v=4"
                  alt="Sarah Chen"
                  className="h-9 w-9 rounded-xl object-cover"
                />
                <div>
                  <h3 className="text-xs font-bold text-white">Sarah Chen</h3>
                  <span className="text-[10px] text-emerald-400">Online • LLM Systems Architect</span>
                </div>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="my-6 space-y-4 overflow-y-auto pr-2">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md rounded-2xl p-3.5 text-xs leading-relaxed ${
                      m.sender === 'me'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-950/80 border border-white/10 text-slate-200'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message or share code link..."
                className="flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
