'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Mic,
  Play,
  Pause,
  CornerUpLeft,
  X,
  QrCode,
  Volume2,
} from 'lucide-react';
import { ChatMessageReplyTo } from '@/lib/types';
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
    setActiveTab,
  } = useAppStore();

  const [inputMessage, setInputMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessageReplyTo | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const thread = chatThreads.find((t) => t.id === threadId);

  useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus();
    }
  }, [replyingTo]);

  useEffect(() => {
    if (threadId) {
      markThreadAsRead(threadId);
    }
  }, [threadId, markThreadAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages]);

  // Recording timer handler
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
    }
    return () => {
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
      }
    };
  }, [isRecording]);

  if (!thread) {
    return (
      <div className="p-6 text-center space-y-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">Thread not found.</p>
        <button
          onClick={() => setActiveThreadId(null)}
          className="text-xs text-teal-600 dark:text-teal-400 font-bold underline"
        >
          Return to inbox
        </button>
      </div>
    );
  }

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    triggerHaptic('tap');
    sendChatMessage(thread.id, inputMessage.trim(), {
      replyTo: replyingTo || undefined,
    });
    setInputMessage('');
    setReplyingTo(null);
  };

  const handleSendAudio = () => {
    triggerHaptic('success');
    const durSec = Math.max(2, recordingSeconds);
    const durStr = `0:${durSec.toString().padStart(2, '0')}`;
    sendChatMessage(thread.id, '', {
      isAudio: true,
      audioDuration: durStr,
      replyTo: replyingTo || undefined,
    });
    setIsRecording(false);
    setRecordingSeconds(0);
    setReplyingTo(null);
  };

  const handleQuickPing = (text: string) => {
    triggerHaptic('tap');
    sendChatMessage(thread.id, text, {
      replyTo: replyingTo || undefined,
    });
    setReplyingTo(null);
  };

  const togglePlayAudio = (msgId: string) => {
    triggerHaptic('tap');
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(msgId);
      setTimeout(() => {
        setPlayingAudioId(null);
      }, 4500);
    }
  };

  const quickPings = [
    { label: '📍 At safe hub', text: "I'm right at the CCTV safe hub now." },
    { label: '⏱️ 5 mins away', text: 'About 5 minutes away, approaching pickup.' },
    { label: '🚗 Boarding now', text: 'I see your car. Boarding now.' },
    { label: '❄️ AC on please', text: 'Can you please turn on the AC?' },
    { label: '🚦 Hit traffic', text: 'Hit a bit of slowdown on the corridor, moving now.' },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden bg-[#F8FAFC] dark:bg-[#0B0F12] select-none animate-in fade-in">
      {/* Top Fixed Thread Navigation & Partner Header */}
      <div className="bg-white/90 dark:bg-[#121921]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 px-3 py-2.5 flex items-center justify-between gap-2 flex-shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveThreadId(null);
            }}
            className="p-1.5 -ml-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 active-press transition-all"
            title="Back to inbox"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative flex-shrink-0">
            <img
              src={thread.partnerAvatar}
              alt={thread.partnerName}
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-black/5 dark:ring-white/10 shadow-sm"
            />
            {thread.isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#121921]" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                {thread.partnerName}
              </h3>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-300 flex-shrink-0">
                {thread.partnerRole === 'driver' ? 'Driver' : 'Co-Rider'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {thread.partnerEmployer}
            </p>
          </div>
        </div>

        {/* Quick Voice Call & WhatsApp Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {thread.partnerPhone && (
            <a
              href={`tel:${thread.partnerPhone}`}
              onClick={() => triggerHaptic('tap')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-teal-700 dark:text-teal-300 hover:bg-teal-500/15 active-press transition-all"
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
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 active-press transition-all"
            title="Open WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pinned Live Ride Cockpit Banner */}
      <div className="bg-white/80 dark:bg-[#121921]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-2.5 mx-2.5 mt-2 shadow-sm space-y-1.5 flex-shrink-0 z-10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
            <Car className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
            <span className="truncate">{thread.routeSummary}</span>
            {thread.vehiclePlate && (
              <span className="font-mono text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                {thread.vehiclePlate}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('pass');
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/15 text-teal-700 dark:text-teal-300 text-[10px] font-bold hover:bg-teal-500/25 transition-all flex-shrink-0"
            title="View Section 44 Commute Pass"
          >
            <QrCode className="w-3 h-3" />
            <span>Pass</span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-white/5 text-[10px]">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="truncate">
              {thread.tripStatus === 'en-route'
                ? `Arriving in ${thread.etaMinutes || 4} mins at ${thread.pickupSafeZoneName.split(',')[0]}`
                : `Pickup: ${thread.pickupSafeZoneName.split(',')[0]}`}
            </span>
          </div>
          <span className="text-teal-700 dark:text-teal-300 font-bold flex items-center gap-0.5 flex-shrink-0">
            <ShieldCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            ₦{(thread.escrowSecuredNgn || 2500).toLocaleString()} Secured
          </span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar">
        {/* Date separator */}
        <div className="text-center my-1">
          <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-white/10 px-2.5 py-0.5 rounded-full shadow-2xs">
            Today
          </span>
        </div>

        {/* Swipe to reply helper pill */}
        <div className="text-center">
          <span className="text-[9px] text-slate-400 dark:text-slate-500">
            Swipe right on a message to reply
          </span>
        </div>

        {thread.messages.map((msg) => {
          const isMe = msg.isUser;
          const isAudio = msg.isAudio;
          const isPlaying = playingAudioId === msg.id;

          return (
            <div
              key={msg.id}
              className={`relative group w-full flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              {/* Swipe-to-reply reveal indicator and click shortcut */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setReplyingTo({
                    id: msg.id,
                    senderName: msg.senderName,
                    text: msg.isAudio ? 'Voice note' : msg.text,
                  });
                }}
                className={`absolute ${isMe ? 'right-[calc(82%+8px)]' : 'left-0'} top-1/2 -translate-y-1/2 p-1 text-teal-600 dark:text-teal-400 opacity-60 hover:opacity-100 z-0 transition-opacity`}
                title="Reply to this message"
              >
                <CornerUpLeft className="w-4 h-4" />
              </button>

              {/* Draggable Message Bubble */}
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0, right: 0.35 }}
                onDragEnd={(e, info) => {
                  if (info.offset.x > 38) {
                    triggerHaptic('tap');
                    setReplyingTo({
                      id: msg.id,
                      senderName: msg.senderName,
                      text: msg.isAudio ? 'Voice note' : msg.text,
                    });
                  }
                }}
                className={`relative z-10 max-w-[82%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm transition-shadow ${
                  isMe
                    ? 'bg-teal-700 dark:bg-teal-600 text-white rounded-tr-xs shadow-teal-900/10'
                    : 'bg-white dark:bg-[#141C24] text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-white/10 rounded-tl-xs'
                }`}
              >
                {/* Quoted Reply Box inside bubble if message is a reply */}
                {msg.replyTo && (
                  <div
                    className={`mb-1.5 px-2.5 py-1 rounded-lg border-l-2 text-[10px] ${
                      isMe
                        ? 'bg-black/15 border-white/80 text-teal-100'
                        : 'bg-slate-100 dark:bg-white/5 border-teal-600 dark:border-teal-400 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold truncate">
                      {msg.replyTo.senderName}
                    </div>
                    <div className="truncate opacity-85">
                      {msg.replyTo.text}
                    </div>
                  </div>
                )}

                {/* Body: Voice note waveform or text */}
                {isAudio ? (
                  <div className="flex items-center gap-2.5 py-1">
                    <button
                      onClick={() => togglePlayAudio(msg.id)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm active-press transition-all ${
                        isMe
                          ? 'bg-white text-teal-800'
                          : 'bg-teal-700 dark:bg-teal-500 text-white dark:text-slate-950'
                      }`}
                      title={isPlaying ? 'Pause' : 'Play audio note'}
                    >
                      {isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Waveform Visualization Bars */}
                    <div className="flex items-center gap-0.5 h-5 flex-1 min-w-[90px]">
                      {(msg.audioWaveform || [35, 60, 45, 80, 50, 75, 40, 65, 85, 55, 45, 70, 35]).map((val, idx) => {
                        const barHeight = Math.max(4, Math.round((val / 100) * 18));
                        return (
                          <div
                            key={idx}
                            style={{ height: `${barHeight}px` }}
                            className={`w-1 rounded-full transition-all ${
                              isPlaying
                                ? isMe
                                  ? 'bg-white animate-pulse'
                                  : 'bg-teal-500 animate-pulse'
                                : isMe
                                ? 'bg-teal-200/70'
                                : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                          />
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono tabular-nums opacity-90 flex-shrink-0">
                      <Mic className="w-2.5 h-2.5" />
                      <span>{msg.audioDuration || '0:04'}</span>
                    </div>
                  </div>
                ) : (
                  <p>{msg.text}</p>
                )}

                {/* Timestamp & Delivery ticks */}
                <div
                  className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${
                    isMe ? 'text-teal-200' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <span className="font-mono">{msg.timestamp}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-teal-200" />}
                </div>
              </motion.div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Pings Row */}
      <div className="p-1 px-2.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 bg-transparent flex-shrink-0">
        {quickPings.map((ping, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPing(ping.text)}
            className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-[#141C24]/80 hover:bg-slate-100 dark:hover:bg-stone-800 text-slate-800 dark:text-slate-200 text-[10.5px] font-bold border border-slate-200/80 dark:border-white/10 shadow-2xs whitespace-nowrap active-press transition-all"
          >
            {ping.label}
          </button>
        ))}
      </div>

      {/* Bottom Area: Replying-to Preview & Input Bar */}
      <div className="p-2 pt-1 space-y-1.5 bg-white/95 dark:bg-[#121921]/95 border-t border-slate-200/80 dark:border-white/10 flex-shrink-0">
        {/* Reply Quote Banner */}
        <AnimatePresence>
          {replyingTo && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-slate-100 dark:bg-white/5 border border-teal-500/30 rounded-xl p-2 px-3 flex items-center justify-between gap-2 shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CornerUpLeft className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-teal-700 dark:text-teal-300">
                    Replying to {replyingTo.senderName}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                    {replyingTo.text}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Cancel reply"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Bar or Voice Recording Bar */}
        {isRecording ? (
          <div className="bg-red-500/10 border border-red-500/30 p-2 rounded-2xl flex items-center justify-between gap-2 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <span className="text-xs font-bold text-red-600 dark:text-red-400">
                Recording audio note: 0:{recordingSeconds.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setIsRecording(false);
                  setRecordingSeconds(0);
                }}
                className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSendAudio}
                className="px-3 py-1.5 rounded-xl bg-teal-700 dark:bg-teal-500 text-white dark:text-slate-950 text-xs font-bold shadow-sm active-press"
              >
                Send Audio
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSend}
            className="flex items-center gap-1.5"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Message ${thread.partnerName.split(' ')[0]}...`}
              className="flex-1 px-3.5 py-2.5 bg-slate-100 dark:bg-[#0E141B] rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200/60 dark:border-white/5 focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 dark:focus:ring-teal-400/30 transition-all"
            />

            {/* Mic trigger button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                setIsRecording(true);
              }}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-teal-500/10 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all active-press"
              title="Record voice note"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className={`p-2.5 rounded-xl transition-all shadow-sm flex-shrink-0 ${
                inputMessage.trim()
                  ? 'bg-teal-700 dark:bg-teal-500 text-white dark:text-slate-950 active-press hover:bg-teal-800'
                  : 'bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
