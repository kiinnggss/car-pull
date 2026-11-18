'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Share2,
  Sparkles,
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
      colors: ['#3B82F6', '#0B0C0E', '#DF8E52'],
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
      colors: ['#3B82F6', '#0B0C0E', '#DF8E52'],
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
    <div className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-xs overflow-y-auto p-3 overscroll-contain flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-[390px] floating-surface rounded-[32px] p-5 space-y-3.5 max-h-[90vh] flex flex-col my-auto animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-display font-black text-[#0B0C0E] dark:text-white">
              Quick Pickup Note
            </h3>
            <span className="text-[11px] text-[#525866] dark:text-[#9BA1AE]">
              Direct peer coordination
            </span>
          </div>

          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] flex items-center justify-center"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Matched Person Capsule */}
        <div className="bg-[#F4F5F7] dark:bg-[#1E2028] rounded-[24px] p-3.5 space-y-2.5">
          <div className="flex items-center gap-3">
            <img
              src={personAvatar}
              alt={personName}
              className="w-11 h-11 rounded-full object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-extrabold text-[#0B0C0E] dark:text-white truncate">
                  {personName}
                </h4>
                {vehiclePlate && <span className="plate-badge flex-shrink-0">{vehiclePlate}</span>}
              </div>

              {tripPurpose && (
                <p className="text-[11px] text-[#525866] dark:text-[#9BA1AE] truncate flex items-center gap-1 mt-0.5">
                  <Compass className="w-3 h-3 text-[#FF9F0A] flex-shrink-0" />
                  <span>{tripPurpose}</span>
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenLinkedIn}
            className="w-full py-2 px-3 rounded-full bg-white dark:bg-[#14161B] text-[#0B0C0E] dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 active-press"
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
          <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-[#525866] dark:text-[#9BA1AE] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FF9F0A]" />
            TAP TO PRE-FILL
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
                className="w-full text-left p-3 rounded-2xl bg-[#F4F5F7] dark:bg-[#1E2028] text-[11px] text-[#0B0C0E] dark:text-white font-semibold active-press leading-snug"
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
            placeholder={`Write a note to ${firstName}...`}
            className="w-full p-3.5 rounded-2xl bg-[#F4F5F7] dark:bg-[#1E2028] text-xs font-semibold text-[#0B0C0E] dark:text-white placeholder:text-[#525866] focus:outline-hidden resize-none"
          />

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="py-3 px-4 rounded-full bg-emerald-600 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 active-press"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="submit"
              disabled={!message.trim()}
              className="py-3 px-4 rounded-full btn-electric-mint disabled:opacity-40 text-xs font-extrabold flex items-center justify-center gap-1.5 active-press"
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
