'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  MapPin,
  Compass,
  RefreshCw,
  ShieldCheck,
  Car,
  X,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const playCockpitTone = (freq: number, type: OscillatorType = 'sine', duration = 0.1) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignore audio restriction
  }
};

interface InteractiveLogoCockpitProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSafeZoneModal?: () => void;
}

type HotspotId = 'pin' | 'arrow' | 'circle' | 'shield' | 'car' | null;

export const InteractiveLogoCockpit: React.FC<InteractiveLogoCockpitProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeRole,
    setActiveRole,
    commuteDirection,
    toggleCommuteDirection,
    setActiveTab,
    resetDeck,
  } = useAppStore();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ modal: 'cockpit' }, '');

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
    if (window.history.state?.modal === 'cockpit') {
      window.history.back();
    } else {
      onClose();
    }
  };

  const handleAction = (id: NonNullable<HotspotId>) => {
    if (soundEnabled) {
      if (id === 'pin') playCockpitTone(587, 'triangle', 0.15);
      if (id === 'arrow') playCockpitTone(784, 'sine', 0.12);
      if (id === 'circle') playCockpitTone(659, 'sine', 0.12);
      if (id === 'shield') playCockpitTone(880, 'sine', 0.15);
      if (id === 'car') {
        playCockpitTone(440, 'sawtooth', 0.08);
        setTimeout(() => playCockpitTone(880, 'sine', 0.12), 60);
      }
    }

    switch (id) {
      case 'pin':
        setActiveTab('map');
        onClose();
        break;

      case 'arrow':
        toggleCommuteDirection();
        break;

      case 'circle':
        resetDeck();
        setActiveTab('deck');
        break;

      case 'shield':
        setActiveTab('pass');
        onClose();
        break;

      case 'car':
        const nextRole = activeRole === 'rider' ? 'driver' : 'rider';
        setActiveRole(nextRole);
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#C8FF00', '#0B0C0E', '#FF9F0A'],
        });
        break;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs overflow-y-auto p-3 overscroll-contain flex items-center justify-center">
      <div className="w-full max-w-[390px] floating-surface rounded-[32px] p-5 space-y-4 my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-display font-black text-[#0B0C0E] dark:text-white">
              Quick Actions
            </h3>
            <span className="text-[10px] font-mono uppercase text-[#525866] dark:text-[#9BA1AE] font-bold">
              CORRIDOR SHORTCUTS
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-8 h-8 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] flex items-center justify-center text-[#0B0C0E] dark:text-white"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={handleBack}
              className="w-8 h-8 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] flex items-center justify-center text-[#0B0C0E] dark:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Uber Green Concentric Ring Hero */}
        <div className="volt-surface rounded-[28px] p-5 flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full border border-[#0B0C0E]/15 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border border-[#0B0C0E]/25 flex items-center justify-center">
              <button
                onClick={() => handleAction('car')}
                className="w-11 h-11 rounded-full bg-[#0B0C0E] text-[#C8FF00] flex items-center justify-center shadow-lg active-press"
              >
                <Zap className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
          <span className="text-xs font-extrabold text-[#0B0C0E] mt-2">
            Tap Emblem to Flip Rider / Driver
          </span>
        </div>

        {/* 2x2 Bento Shortcut Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <button
            onClick={() => handleAction('pin')}
            className="p-3.5 bg-[#F4F5F7] dark:bg-[#1E2028] text-[#0B0C0E] dark:text-white rounded-[22px] font-extrabold flex items-center gap-2 active-press text-left"
          >
            <MapPin className="w-4 h-4 text-[#FF9F0A] flex-shrink-0" />
            <span>Route Map</span>
          </button>

          <button
            onClick={() => handleAction('arrow')}
            className="p-3.5 bg-[#F4F5F7] dark:bg-[#1E2028] text-[#0B0C0E] dark:text-white rounded-[22px] font-extrabold flex items-center gap-2 active-press text-left"
          >
            <Compass className="w-4 h-4 text-[#FF9F0A] flex-shrink-0" />
            <span>{commuteDirection === 'morning' ? 'AM Outbound' : 'PM Return'}</span>
          </button>

          <button
            onClick={() => handleAction('circle')}
            className="p-3.5 bg-[#F4F5F7] dark:bg-[#1E2028] text-[#0B0C0E] dark:text-white rounded-[22px] font-extrabold flex items-center gap-2 active-press text-left"
          >
            <RefreshCw className="w-4 h-4 text-[#FF9F0A] flex-shrink-0" />
            <span>Reload Deck</span>
          </button>

          <button
            onClick={() => handleAction('shield')}
            className="p-3.5 bg-[#F4F5F7] dark:bg-[#1E2028] text-[#0B0C0E] dark:text-white rounded-[22px] font-extrabold flex items-center gap-2 active-press text-left"
          >
            <ShieldCheck className="w-4 h-4 text-[#FF9F0A] flex-shrink-0" />
            <span>Sec 44 Pass</span>
          </button>
        </div>

        <button
          onClick={() => handleAction('car')}
          className="w-full py-3.5 btn-electric-mint rounded-full font-extrabold text-xs flex items-center justify-center gap-2 active-press"
        >
          <Car className="w-4 h-4" />
          <span>Switch to {activeRole === 'rider' ? 'Driver Console' : 'Rider Swipe Deck'}</span>
        </button>
      </div>
    </div>,
    document.body
  );
};
