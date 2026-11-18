'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  ArrowLeft,
  Phone,
  Share2,
  Send,
  Car,
  CheckCheck,
  Mic,
  Play,
  Pause,
  CornerUpLeft,
  X,
  QrCode,
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
        <p className="text-xs text-[#525866]">Thread not found.</p>
        <button
          onClick={() => setActiveThreadId(null)}
          className="text-xs font-extrabold underline"
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
    { label: 'At safe hub', text: "I'm right at the CCTV safe hub now." },
    { label: '5 mins away', text: 'About 5 minutes away, approaching pickup.' },
    { label: 'Boarding now', text: 'I see your car. Boarding now.' },
    { label: 'AC on please', text: 'Can you please turn on the AC?' },
    { label: 'Hit traffic', text: 'Hit a bit of slowdown on the corridor, moving now.' },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden bg-[#F4F5F7] dark:bg-[#0B0C0E] select-none animate-in fade-in">
      {/* Top Partner Header */}
      <div className="bg-white dark:bg-[#14161B] px-3.5 py-2.5 flex items-center justify-between gap-2 flex-shrink-0 z-20 border-b border-black/6 dark:border-white/8">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveThreadId(null);
            }}
            className="w-9 h-9 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] text-[#0B0C0E] dark:text-white flex items-center justify-center active-press flex-shrink-0"
            title="Back to inbox"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="relative flex-shrink-0">
            <div className="relative w-10 h-10 rounded-full bg-[#0B0C0E] text-[#C8FF00] flex items-center justify-center font-mono font-bold text-xs overflow-hidden">
              <span>{thread.partnerName.split(' ').map((n) => n[0]).join('')}</span>
              <img
                src={thread.partnerAvatar}
                alt={thread.partnerName}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            {thread.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#C8FF00] ring-2 ring-white dark:ring-[#14161B] z-10" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <h3 className="text-xs font-display font-black text-[#0B0C0E] dark:text-white truncate">
                {thread.partnerName}
              </h3>
              <span className="text-[9px] font-mono uppercase font-black px-2 py-0.5 rounded-full bg-[#C8FF00] text-[#0B0C0E] flex-shrink-0">
                {thread.partnerRole === 'driver' ? 'DRIVER' : 'CO-RIDER'}
              </span>
            </div>
            <p className="text-[10px] text-[#525866] dark:text-[#9BA1AE] truncate font-medium">
              {thread.partnerEmployer}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {thread.partnerPhone && (
            <a
              href={`tel:${thread.partnerPhone}`}
              onClick={() => triggerHaptic('tap')}
              className="w-9 h-9 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] text-[#0B0C0E] dark:text-white flex items-center justify-center active-press"
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
            className="w-9 h-9 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] text-emerald-500 flex items-center justify-center active-press"
            title="Open WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Charlie Waite "The re-designed Uber App" Frosted Live Car Progress Widget */}
      <div className="bg-[#0B0C0E] dark:bg-[#14161B] rounded-[24px] p-3.5 mx-3 mt-2.5 text-white space-y-2 flex-shrink-0 z-10 shadow-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-extrabold truncate">
            <span className="truncate">{thread.routeSummary}</span>
            {thread.vehiclePlate && (
              <span className="px-2 py-0.5 rounded-full bg-[#FF9F0A] text-[#0B0C0E] font-mono text-[10px] font-black">
                {thread.vehiclePlate}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('pass');
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C8FF00] text-[#0B0C0E] text-[10px] font-mono font-black active-press flex-shrink-0"
          >
            <QrCode className="w-3 h-3" />
            <span>SEC 44 PASS</span>
          </button>
        </div>

        {/* Horizontal Car Progress Track */}
        <div className="relative h-1.5 w-full rounded-full bg-white/20 flex items-center my-1">
          <div className="h-full w-[62%] rounded-full bg-[#C8FF00]" />
          <div
            style={{ left: '58%' }}
            className="absolute -translate-x-1/2 w-8 h-4 rounded-full bg-white text-[#0B0C0E] flex items-center justify-center shadow-sm"
          >
            <Car className="w-2.5 h-2.5 fill-current" />
          </div>
          <span className="absolute right-0 w-2 h-2 rounded-full bg-[#FF9F0A]" />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-white/75">
          <span className="truncate">
            ETA {thread.etaMinutes || 4}m • {thread.pickupSafeZoneName.split(',')[0]}
          </span>
          <span className="text-[#C8FF00] font-bold">
            ₦{(thread.escrowSecuredNgn || 2500).toLocaleString()} ESCROW
          </span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar">
        <div className="text-center">
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#525866] dark:text-[#9BA1AE]">
            SWIPE RIGHT ON ANY MESSAGE TO QUOTE REPLY
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
                className={`absolute ${isMe ? 'right-[calc(82%+8px)]' : 'left-0'} top-1/2 -translate-y-1/2 p-1 text-[#525866] opacity-60 hover:opacity-100 z-0`}
                title="Reply to message"
              >
                <CornerUpLeft className="w-4 h-4" />
              </button>

              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0, right: 0.35 }}
                onDragEnd={(_e, info) => {
                  if (info.offset.x > 38) {
                    triggerHaptic('tap');
                    setReplyingTo({
                      id: msg.id,
                      senderName: msg.senderName,
                      text: msg.isAudio ? 'Voice note' : msg.text,
                    });
                  }
                }}
                className={`relative z-10 max-w-[82%] rounded-[22px] px-4 py-2.5 text-xs leading-relaxed ${
                  isMe
                    ? 'bg-[#0B0C0E] dark:bg-[#C8FF00] text-white dark:text-[#0B0C0E] rounded-tr-xs font-medium'
                    : 'bg-white dark:bg-[#14161B] text-[#0B0C0E] dark:text-white border border-black/6 dark:border-white/8 rounded-tl-xs'
                }`}
              >
                {msg.replyTo && (
                  <div
                    className={`mb-1.5 px-3 py-1.5 rounded-2xl border text-[10px] ${
                      isMe
                        ? 'bg-white/10 dark:bg-black/10 border-white/15 dark:border-black/15'
                        : 'bg-[#F4F5F7] dark:bg-[#1E2028] border-black/8 dark:border-white/10'
                    }`}
                  >
                    <div className="font-mono font-bold uppercase text-[9px] truncate opacity-80">
                      {msg.replyTo.senderName}
                    </div>
                    <div className="truncate opacity-90">{msg.replyTo.text}</div>
                  </div>
                )}

                {isAudio ? (
                  <div className="flex items-center gap-2.5 py-1">
                    <button
                      onClick={() => togglePlayAudio(msg.id)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 active-press ${
                        isMe
                          ? 'bg-[#C8FF00] dark:bg-[#0B0C0E] text-[#0B0C0E] dark:text-[#C8FF00]'
                          : 'bg-[#0B0C0E] dark:bg-[#C8FF00] text-white dark:text-[#0B0C0E]'
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="flex items-center gap-0.5 h-5 flex-1 min-w-[90px]">
                      {(msg.audioWaveform || [35, 60, 45, 80, 50, 75, 40, 65, 85, 55, 45, 70, 35]).map((val, idx) => {
                        const barHeight = Math.max(4, Math.round((val / 100) * 18));
                        return (
                          <div
                            key={idx}
                            style={{ height: `${barHeight}px` }}
                            className={`w-1 rounded-full ${
                              isPlaying ? 'animate-pulse bg-[#FF9F0A]' : 'bg-current opacity-60'
                            }`}
                          />
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono tabular-nums opacity-80">
                      <Mic className="w-2.5 h-2.5" />
                      <span>{msg.audioDuration || '0:04'}</span>
                    </div>
                  </div>
                ) : (
                  <p>{msg.text}</p>
                )}

                <div className="flex items-center justify-end gap-1 text-[9px] mt-1 opacity-70">
                  <span className="font-mono tabular-nums">{msg.timestamp}</span>
                  {isMe && <CheckCheck className="w-3 h-3" />}
                </div>
              </motion.div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Pings Strip */}
      <div className="py-1.5 px-3 overflow-x-auto no-scrollbar flex items-center gap-1.5 flex-shrink-0">
        {quickPings.map((ping, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPing(ping.text)}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-[#14161B] text-[#0B0C0E] dark:text-white text-[11px] font-bold border border-black/6 dark:border-white/10 whitespace-nowrap active-press"
          >
            {ping.label}
          </button>
        ))}
      </div>

      {/* Bottom Composer Pill Bar */}
      <div className="p-2.5 bg-white dark:bg-[#14161B] border-t border-black/6 dark:border-white/8 space-y-1.5 flex-shrink-0">
        <AnimatePresence>
          {replyingTo && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-[#F4F5F7] dark:bg-[#1E2028] rounded-2xl p-2 px-3 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CornerUpLeft className="w-3.5 h-3.5 text-[#FF9F0A] flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-mono font-bold text-[#0B0C0E] dark:text-[#C8FF00] uppercase">
                    Replying to {replyingTo.senderName}
                  </div>
                  <div className="text-[11px] text-[#525866] dark:text-[#9BA1AE] truncate">
                    {replyingTo.text}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-1 rounded-full hover:bg-black/5 text-[#525866]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {isRecording ? (
          <div className="bg-red-500/12 rounded-full p-2 px-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span className="text-xs font-mono tabular-nums font-bold text-red-600 dark:text-red-400">
                REC 0:{recordingSeconds.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setIsRecording(false);
                  setRecordingSeconds(0);
                }}
                className="text-xs font-bold text-[#525866]"
              >
                Cancel
              </button>
              <button
                onClick={handleSendAudio}
                className="px-4 py-1.5 rounded-full btn-electric-mint text-xs font-extrabold active-press"
              >
                Send Voice
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Message ${thread.partnerName.split(' ')[0]}...`}
              className="flex-1 px-4 py-2.5 bg-[#F4F5F7] dark:bg-[#1E2028] rounded-full text-xs font-semibold text-[#0B0C0E] dark:text-white placeholder:text-[#525866] dark:placeholder:text-[#9BA1AE] focus:outline-hidden"
            />

            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                setIsRecording(true);
              }}
              className="w-10 h-10 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] text-[#0B0C0E] dark:text-white flex items-center justify-center active-press flex-shrink-0"
              title="Record voice note"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                inputMessage.trim()
                  ? 'btn-electric-mint active-press'
                  : 'bg-[#F4F5F7] dark:bg-[#1E2028] text-[#9BA1AE] cursor-not-allowed'
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
