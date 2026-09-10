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
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { triggerHaptic } from '@/lib/haptics';

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
  linkedinHandle?: string;
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
  linkedinHandle,
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
    triggerHaptic('tap');
    if (window.history.state?.modal === 'icebreaker') {
      window.history.back();
    } else {
      onClose();
    }
  };

  const firstName = personName.split(' ')[0];

  const icebreakerSuggestions = [
    tripPurpose
      ? `Heading over to "${tripPurpose}" as well? Great connecting on CAR PULL!`
      : `Hi ${firstName}! What time are you pulling up at the safe hub?`,
    musicVibe
      ? `Saw your vibe tag (${musicVibe})—mind if we queue up a commute playlist?`
      : `Hey ${firstName}! Looking forward to sharing the ride and beating the traffic.`,
    `Great connecting on CAR PULL! I'll be waiting at the designated CCTV safe hub.`,
  ];

  const handleSendWhatsApp = () => {
    triggerHaptic('success');
    const finalMsg = message.trim() || icebreakerSuggestions[0];
    const text = `*CAR PULL - Hello ${firstName}!* 🚗\n\n${finalMsg}\n\n(Coordinating via CAR PULL Non-Commercial Lagos Carpool)`;
    
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

    triggerHaptic('success');
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

  const handleOpenLinkedIn = () => {
    triggerHaptic('tap');
    const url = linkedinHandle
      ? `https://linkedin.com/in/${linkedinHandle}`
      : `https://linkedin.com/search/results/all/?keywords=${encodeURIComponent(personName)}`;
    window.open(url, '_blank');
  };

  return createPortal(
    <div className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-xs overflow-y-auto p-2 sm:p-3 overscroll-contain flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-[390px] bg-[#FAF8F3] rounded-t-3xl sm:rounded-3xl p-4 space-y-3 shadow-2xl border border-[#DDD4C5] max-h-[90vh] flex flex-col my-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Header with Step-Back Navigation */}
        <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-stone-100 text-[#141210] border border-[#DDD4C5] font-bold text-xs transition-all active:scale-95 shadow-2xs active-press"
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
            className="w-7 h-7 rounded-full bg-white hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center border border-[#DDD4C5] transition-colors active-press"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Matched Person Profile Capsule */}
        <div className="bg-white rounded-2xl p-3 border border-[#DDD4C5] shadow-2xs space-y-2">
          <div className="flex items-center gap-3">
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

          {/* LinkedIn Handshake Button */}
          <button
            type="button"
            onClick={handleOpenLinkedIn}
            className="w-full py-1.5 px-2.5 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 text-[#0A66C2] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all active-press"
          >
            <span className="w-3.5 h-3.5 bg-[#0A66C2] text-white rounded-xs flex items-center justify-center text-[9px] font-black leading-none">
              in
            </span>
            <span>Connect on LinkedIn</span>
            <ExternalLink className="w-3 h-3 text-[#0A66C2]" />
          </button>
        </div>

        {/* Icebreaker Suggestions */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#70665A] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Everyday Lagos Icebreakers (Tap to use)
          </span>
          <div className="space-y-1">
            {icebreakerSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setMessage(prompt);
                }}
                className="w-full text-left p-2 rounded-xl bg-white hover:bg-amber-50/70 border border-[#DDD4C5] text-[11px] text-[#141210] font-medium transition-all active-press leading-snug"
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
              placeholder={`Write a friendly note to ${firstName}...`}
              className="w-full p-2.5 rounded-xl bg-white border border-[#DDD4C5] text-xs text-[#141210] placeholder:text-[#70665A] focus:outline-hidden focus:ring-1 focus:ring-[#0D6E6E] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all active-press"
              title="Open WhatsApp chat with pre-filled icebreaker"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp Chat</span>
            </button>

            <button
              type="submit"
              disabled={!message.trim()}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all active-press ${
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

