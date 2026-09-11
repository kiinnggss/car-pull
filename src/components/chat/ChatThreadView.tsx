'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  ArrowLeft,
  Phone,
  Share2,
  Send,
  ShieldCheck,
  MapPin,
  Car,
  CheckCheck,
  Clock,
  Sparkles,
  Snowflake,
  ExternalLink,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface ChatThreadViewProps {
  threadId: string;
}

export const ChatThreadView: React.FC<ChatThreadViewProps> = ({ threadId }) => {
  const {
    chatThreads,
    setActiveThreadId,
    sendChatMessage,
    markThreadAsRead,
  } = useAppStore();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const thread = chatThreads.find((t) => t.id === threadId);

  useEffect(() => {
    if (threadId) {
      markThreadAsRead(threadId);
    }
  }, [threadId, markThreadAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages]);

  if (!thread) {
    return (
      <div className="p-4 text-center">
        <button
          onClick={() => setActiveThreadId(null)}
          className="text-xs text-[#0D6E6E] font-bold"
        >
          &larr; Back to Inbox
        </button>
      </div>
    );
  }

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    triggerHaptic('tap');
    sendChatMessage(thread.id, inputMessage.trim());
    setInputMessage('');
  };

  const handleQuickPing = (text: string) => {
    triggerHaptic('tap');
    sendChatMessage(thread.id, text);
  };

  const quickPings = [
    { label: '📍 At safe hub', text: "I'm right at the CCTV safe hub now." },
    { label: '⏱️ 5 mins away', text: 'About 5 minutes away, approaching pickup.' },
    { label: '🚗 Boarding now', text: 'I see your car! Boarding now.' },
    { label: '❄️ AC on please', text: 'Can you please turn on the AC?' },
    { label: '🚦 In traffic', text: 'Hit a bit of slowdown at the roundabout, on my way.' },
  ];

  return (
    <div className="w-full max-w-[390px] mx-auto px-2 h-[calc(100vh-145px)] min-h-[500px] flex flex-col justify-between animate-in fade-in">
      {/* Top Thread Navigation & Profile Header */}
      <div className="bg-white/95 dark:bg-[#1A1816]/95 backdrop-blur-md border-b border-[#DDD4C5] dark:border-stone-800 p-2.5 rounded-t-2xl flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveThreadId(null);
            }}
            className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-[#141210] dark:text-stone-200 transition-all active-press"
            title="Return to Inbox"
          >
            <ArrowLeft className="w-4 h-4 text-[#C25E2E] dark:text-amber-400" />
          </button>

          <div className="relative flex-shrink-0">
            <img
              src={thread.partnerAvatar}
              alt={thread.partnerName}
              className="w-9 h-9 rounded-xl object-cover border border-[#DDD4C5] dark:border-stone-700"
            />
            {thread.isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1A1816]" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <h3 className="text-xs font-serif font-black text-[#141210] dark:text-[#EDE8E1] truncate">
                {thread.partnerName}
              </h3>
              <span className="text-[9px] font-mono text-[#0D6E6E] dark:text-[#14B8A6] bg-teal-50 dark:bg-teal-950/60 px-1 py-0.2 rounded border border-teal-200 dark:border-teal-800 flex-shrink-0">
                {thread.partnerRole === 'driver' ? 'Driver' : 'Co-Rider'}
              </span>
            </div>
            <p className="text-[10px] text-[#70665A] dark:text-stone-400 truncate">
              {thread.partnerEmployer} {thread.vehiclePlate ? `• ${thread.vehiclePlate}` : ''}
            </p>
          </div>
        </div>

        {/* Quick Contact Fallbacks */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {thread.partnerPhone && (
            <a
              href={`tel:${thread.partnerPhone}`}
              onClick={() => triggerHaptic('tap')}
              className="p-2 rounded-xl bg-[#FAF6EE] dark:bg-stone-800 text-[#0D6E6E] dark:text-[#14B8A6] hover:bg-stone-100 dark:hover:bg-stone-700 active-press border border-[#DDD4C5] dark:border-stone-700 shadow-2xs"
              title="Voice Call"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={() => {
              triggerHaptic('tap');
              const text = `*CAR PULL - Connecting with ${thread.partnerName}*\nRoute: ${thread.routeSummary}\nSafe Hub: ${thread.pickupSafeZoneName}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="p-2 rounded-xl bg-[#FAF6EE] dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-700 active-press border border-[#DDD4C5] dark:border-stone-700 shadow-2xs"
            title="Open WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Safe Hub Strip */}
      <div className="bg-[#FAF6EE] dark:bg-[#141210] border-x border-b border-[#DDD4C5] dark:border-stone-800 px-3 py-1.5 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5 text-[#70665A] dark:text-stone-400 truncate">
          <MapPin className="w-3 h-3 text-[#C25E2E] dark:text-amber-400 flex-shrink-0" />
          <span className="truncate">{thread.pickupSafeZoneName}</span>
        </div>
        <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 flex-shrink-0">
          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Escrow Safe
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar">
        {/* Date separator */}
        <div className="text-center my-1">
          <span className="text-[9.5px] font-bold text-[#70665A] dark:text-stone-500 bg-[#ECE5D8] dark:bg-stone-800 px-2.5 py-0.5 rounded-full shadow-2xs">
            Today
          </span>
        </div>

        {thread.messages.map((msg) => {
          const isMe = msg.isUser;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 shadow-2xs text-xs leading-relaxed ${
                  isMe
                    ? 'bg-[#0D6E6E] dark:bg-[#0D6E6E] text-white rounded-tr-xs'
                    : 'bg-white dark:bg-[#1E1B18] text-[#141210] dark:text-stone-200 border border-[#DDD4C5] dark:border-stone-800 rounded-tl-xs'
                }`}
              >
                <p>{msg.text}</p>
                <div
                  className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${
                    isMe ? 'text-teal-100' : 'text-[#70665A] dark:text-stone-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-teal-200" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Pings Row */}
      <div className="p-1 px-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 bg-[#F6F2EA]/80 dark:bg-[#121110]/80 backdrop-blur-xs border-t border-[#DDD4C5] dark:border-stone-800">
        {quickPings.map((ping, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPing(ping.text)}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#1E1B18] hover:bg-stone-100 dark:hover:bg-stone-700 text-[#141210] dark:text-stone-300 text-[10.5px] font-bold border border-[#DDD4C5] dark:border-stone-700 shadow-2xs whitespace-nowrap active-press transition-all"
          >
            {ping.label}
          </button>
        ))}
      </div>

      {/* Message Input Bar */}
      <form
        onSubmit={handleSend}
        className="bg-white dark:bg-[#1A1816] p-2 border-t border-[#DDD4C5] dark:border-stone-800 rounded-b-2xl flex items-center gap-2 shadow-sm"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Message ${thread.partnerName.split(' ')[0]}...`}
          className="flex-1 px-3 py-2 bg-[#F6F2EA] dark:bg-[#121110] border border-[#DDD4C5] dark:border-stone-700 rounded-xl text-xs text-[#141210] dark:text-[#EDE8E1] placeholder:text-[#70665A]/60 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-2 focus:ring-[#0D6E6E] dark:focus:ring-[#14B8A6] transition-all"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className={`p-2.5 rounded-xl transition-all shadow-2xs flex-shrink-0 ${
            inputMessage.trim()
              ? 'bg-[#0D6E6E] dark:bg-[#14B8A6] text-white dark:text-[#121110] active-press hover:bg-[#094E4E]'
              : 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
          }`}
          title="Send message"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
