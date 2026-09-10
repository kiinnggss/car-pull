'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  MessageCircle,
  Share2,
  Sparkles,
  ArrowLeft,
  X,
  Send,
  Music,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface IcebreakerChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  personName: string;
  personAvatar: string;
  tripPurpose?: string;
  conversationVibe?: string;
  musicVibe?: string;
  interests?: string[];
  vehiclePlate?: string;
  phone?: string;
}

export const IcebreakerChatModal: React.FC<IcebreakerChatModalProps> = ({
  isOpen,
  onClose,
  personName,
  personAvatar,
  tripPurpose,
  conversationVibe,
  musicVibe,
  interests = [],
  vehiclePlate,
  phone = '+234 812 000 0000',
}) => {
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Back button integration: hardware or browser back navigates back a step
  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ modal: 'icebreaker' }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleBack = () => {
    if (window.history.state?.modal === 'icebreaker') {
      window.history.back();
    } else {
      onClose();
    }
  };

  const icebreakerSuggestions = [
    musicVibe
      ? `Hey ${personName.split(' ')[0]}! Saw your music tag (${musicVibe})—mind if I queue up some tracks?`
      : `Hey ${personName.split(' ')[0]}! Looking forward to riding together.`,
    tripPurpose
      ? `Heading to "${tripPurpose}" as well? Great to connect!`
      : `Hi ${personName.split(' ')[0]}! What time are you planning to pull up at the safe hub?`,
    `Great connecting on CAR PULL! I'll be waiting at the designated CCTV safe hub.`,
  ];

  const handleSendWhatsApp = () => {
    const finalMsg = message.trim() || icebreakerSuggestions[0];
    const text = `*CAR PULL - Hello ${personName.split(' ')[0]}!* 🚗\n\n${finalMsg}\n\n(Coordinating via CAR PULL Non-Commercial Lagos Carpool)`;
    
    confetti({
      particleCount: 30,
      spread: 45,
      origin: { y: 0.6 },
      colors: ['#0D6E6E', '#C25E2E', '#25D366'],
    });

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1500);
  };

  const handleSendInApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.6 },
      colors: ['#0D6E6E', '#C25E2E', '#7C3AED'],
    });

    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1200);
  };

  return createPortal(
    <div className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-xs overflow-y-auto p-2 sm:p-3 overscroll-contain flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-[390px] bg-[#FAF8F3] rounded-t-3xl sm:rounded-3xl p-4 space-y-3 shadow-2xl border border-[#DDD4C5] max-h-[90vh] flex flex-col my-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Header with Step-Back Navigation */}
        <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-stone-100 text-[#141210] border border-[#DDD4C5] font-bold text-xs transition-all active:scale-95 shadow-2xs"
            title="Go back"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C25E2E]" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h3 className="text-sm font-serif font-black text-[#141210]">
              Break the Ice
            </h3>
            <span className="text-[10px] text-[#70665A] font-semibold block">
              Say hello before the ride
            </span>
          </div>

          <button
            onClick={handleBack}
            className="w-7 h-7 rounded-full bg-white hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center border border-[#DDD4C5] transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Matched Person Profile Capsule */}
        <div className="bg-white rounded-2xl p-3 border border-[#DDD4C5] shadow-2xs flex items-center gap-3">
          <img
            src={personAvatar}
            alt={personName}
            className="w-12 h-12 rounded-xl object-cover border border-[#DDD4C5] flex-shrink-0"
          />
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-serif font-black text-[#141210] truncate">
                {personName}
              </h4>
              {vehiclePlate && (
                <span className="font-mono text-[9px] font-black text-[#C25E2E] bg-[#FFF9EE] px-1.5 py-0.2 rounded border border-[#C25E2E]/30">
                  {vehiclePlate}
                </span>
              )}
            </div>

            {tripPurpose && (
              <p className="text-[10px] text-[#0D6E6E] font-medium truncate flex items-center gap-1">
                <Compass className="w-3 h-3 text-[#C25E2E] flex-shrink-0" />
                <span>{tripPurpose}</span>
              </p>
            )}

            <div className="flex items-center gap-1 flex-wrap pt-0.5">
              {conversationVibe && (
                <span className="text-[8px] font-black text-[#0D6E6E] bg-teal-50 px-1.5 py-0.2 rounded">
                  {conversationVibe}
                </span>
              )}
              {interests.slice(0, 2).map((item, idx) => (
                <span key={idx} className="text-[8px] font-medium text-[#70665A] bg-stone-100 px-1 rounded">
                  #{item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Icebreaker Suggestions */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#70665A] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick Lagos Icebreakers (Tap to use)
          </span>
          <div className="space-y-1">
            {icebreakerSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMessage(prompt)}
                className="w-full text-left p-2 rounded-xl bg-white hover:bg-amber-50/70 border border-[#DDD4C5] text-[11px] text-[#141210] font-medium transition-all active:scale-[0.99] leading-snug"
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendInApp} className="space-y-2">
          <div className="relative">
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Write a friendly note to ${personName.split(' ')[0]}...`}
              className="w-full p-2.5 rounded-xl bg-white border border-[#DDD4C5] text-xs text-[#141210] placeholder:text-[#70665A] focus:outline-hidden focus:ring-1 focus:ring-[#0D6E6E] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all"
              title="Open WhatsApp chat with pre-filled icebreaker"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp Chat</span>
            </button>

            <button
              type="submit"
              disabled={!message.trim()}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all ${
                message.trim()
                  ? 'bg-[#0D6E6E] hover:bg-[#094E4E] text-white'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              {sentSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Sent!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send In-App</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
