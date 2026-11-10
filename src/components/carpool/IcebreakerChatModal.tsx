'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Share2,
  Sparkles,
  ArrowLeft,
  X,
  Send,
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
  linkedinHandle,
}) => {
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      ? `Heading over to "${tripPurpose}" as well? Great connecting on CAR PULL.`
      : `Hi ${firstName}, what time are you pulling up at the safe hub?`,
    musicVibe
      ? `Saw your vibe tag (${musicVibe}), mind if we queue up a commute playlist?`
      : `Hey ${firstName}, looking forward to sharing the ride and beating the traffic.`,
    `Great connecting on CAR PULL. I will be waiting at the designated CCTV safe hub.`,
  ];

  const handleSendWhatsApp = () => {
    triggerHaptic('success');
    const finalMsg = message.trim() || icebreakerSuggestions[0];
    const text = `*CAR PULL - Hello ${firstName}*\n\n${finalMsg}\n\n(Coordinating via CAR PULL Non-Commercial Lagos Carpool)`;

    confetti({
      particleCount: 30,
      spread: 45,
      origin: { y: 0.6 },
      colors: ['#0F766E', '#14B8A6', '#25D366'],
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
      colors: ['#0F766E', '#D97706', '#14B8A6'],
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
    <div className="fixed inset-0 z-[600] bg-slate-950/70 backdrop-blur-xs overflow-y-auto p-3 overscroll-contain flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-[390px] floating-surface rounded-2xl p-4 space-y-3.5 max-h-[90vh] flex flex-col my-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Header with Step-Back Navigation */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 dark:border-white/8">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#171F29] border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-100 font-bold text-xs active-press transition-all"
            title="Go back"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
              Direct Note
            </h3>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold block">
              CO-RIDER COORDINATION
            </span>
          </div>

          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#171F29] border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Matched Person Profile Capsule */}
        <div className="bg-slate-50/90 dark:bg-[#171F29] border border-slate-200/80 dark:border-white/8 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center gap-3">
            <img
              src={personAvatar}
              alt={personName}
              className="w-11 h-11 rounded-xl object-cover border border-slate-200/80 dark:border-white/10 flex-shrink-0"
            />
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                  {personName}
                </h4>
                {vehiclePlate && (
                  <span className="plate-badge flex-shrink-0">{vehiclePlate}</span>
                )}
              </div>

              {tripPurpose && (
                <p className="text-[10.5px] text-[#0F766E] dark:text-[#14B8A6] font-semibold truncate flex items-center gap-1">
                  <Compass className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <span>{tripPurpose}</span>
                </p>
              )}

              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                {conversationVibe && (
                  <span className="text-[8.5px] font-mono font-bold text-[#0F766E] dark:text-[#14B8A6] bg-teal-500/12 border border-teal-500/20 px-1.5 py-0.5 rounded-md">
                    {conversationVibe}
                  </span>
                )}
                {interests.slice(0, 2).map((item, idx) => (
                  <span
                    key={idx}
                    className="text-[8.5px] font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-[#11171E] border border-slate-200/70 dark:border-white/8 px-1.5 py-0.5 rounded-md"
                  >
                    #{item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenLinkedIn}
            className="w-full py-2 px-3 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/25 text-[#0A66C2] dark:text-blue-400 text-xs font-bold flex items-center justify-center gap-1.5 active-press transition-all"
          >
            <span className="w-4 h-4 bg-[#0A66C2] text-white rounded flex items-center justify-center text-[9px] font-black leading-none">
              in
            </span>
            <span>Verify on LinkedIn</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Icebreaker Suggestions */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            QUICK CORRIDOR NOTES (TAP TO USE)
          </span>
          <div className="space-y-1.5">
            {icebreakerSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setMessage(prompt);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-[#171F29] hover:bg-slate-100 dark:hover:bg-[#1E2936] border border-slate-200/80 dark:border-white/8 text-[11px] text-slate-800 dark:text-slate-200 font-medium transition-all active-press leading-snug"
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendInApp} className="space-y-2">
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Write a quick pickup note to ${firstName}...`}
            className="w-full p-3 rounded-xl bg-slate-100 dark:bg-[#171F29] border border-slate-200/80 dark:border-white/8 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-[#0F766E] dark:focus:border-[#14B8A6] resize-none"
          />

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active-press"
              title="Open WhatsApp chat"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="submit"
              disabled={!message.trim()}
              className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all active-press ${
                message.trim()
                  ? 'btn-electric-mint'
                  : 'bg-slate-200 dark:bg-[#171F29] text-slate-400 dark:text-slate-600 border border-slate-200/80 dark:border-white/5 cursor-not-allowed'
              }`}
            >
              {sentSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sent</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Note</span>
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
