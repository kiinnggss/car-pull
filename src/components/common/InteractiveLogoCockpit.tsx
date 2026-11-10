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
  ArrowLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getAssetPath } from '@/lib/assets';

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

  const [hoveredHotspot, setHoveredHotspot] = useState<HotspotId>(null);
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
          colors: ['#D97706', '#0F766E', '#14B8A6'],
        });
        break;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs overflow-y-auto p-3 overscroll-contain flex items-center justify-center">
      <div className="w-full max-w-[390px] floating-surface rounded-2xl p-4 space-y-3.5 my-auto animate-in zoom-in-95 duration-150">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 dark:border-white/8">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#171F29] border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-100 font-bold text-xs transition-all active-press"
            title="Go back a step"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Cockpit Telemetry
            </h3>
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
              HARDWARE SHORTCUTS
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              title={soundEnabled ? 'Mute audio feedback' : 'Enable audio feedback'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <button
              onClick={handleBack}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#171F29] border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
              title="Close console"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Logo Display with Calibrated Touch Hotspots */}
        <div className="relative w-36 h-36 mx-auto rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#171F29] border border-slate-200/80 dark:border-white/10 p-2 flex items-center justify-center">
          <img
            src={getAssetPath('/logo.png')}
            alt="CAR PULL Interactive Logo"
            className="w-full h-full object-contain select-none pointer-events-none rounded-xl"
          />

          <button
            onClick={() => handleAction('pin')}
            onMouseEnter={() => setHoveredHotspot('pin')}
            onMouseLeave={() => setHoveredHotspot(null)}
            style={{ top: '10%', left: '20%', width: '28%', height: '26%' }}
            className={`absolute rounded-xl cursor-pointer transition-all active:scale-90 ${
              hoveredHotspot === 'pin'
                ? 'ring-2 ring-amber-400 bg-amber-400/30 scale-105'
                : 'hover:bg-amber-400/20'
            }`}
            title="Safe Zones: Open Corridor Map"
            aria-label="Open Corridor Map"
          >
            <span className="sr-only">Safe Zones</span>
          </button>

          <button
            onClick={() => handleAction('arrow')}
            onMouseEnter={() => setHoveredHotspot('arrow')}
            onMouseLeave={() => setHoveredHotspot(null)}
            style={{ top: '10%', left: '52%', width: '28%', height: '26%' }}
            className={`absolute rounded-xl cursor-pointer transition-all active:scale-90 ${
              hoveredHotspot === 'arrow'
                ? 'ring-2 ring-teal-400 bg-teal-400/30 scale-105'
                : 'hover:bg-teal-400/20'
            }`}
            title="Toggle AM/PM Commute Corridor"
            aria-label="Toggle AM/PM Commute Route"
          >
            <span className="sr-only">Route Direction</span>
          </button>

          <button
            onClick={() => handleAction('circle')}
            onMouseEnter={() => setHoveredHotspot('circle')}
            onMouseLeave={() => setHoveredHotspot(null)}
            style={{ top: '38%', left: '20%', width: '28%', height: '26%' }}
            className={`absolute rounded-xl cursor-pointer transition-all active:scale-90 ${
              hoveredHotspot === 'circle'
                ? 'ring-2 ring-cyan-400 bg-cyan-400/30 scale-105'
                : 'hover:bg-cyan-400/20'
            }`}
            title="Reset & Refresh Corridor Deck"
            aria-label="Refresh Corridor Deck"
          >
            <span className="sr-only">Corridor Deck</span>
          </button>

          <button
            onClick={() => handleAction('shield')}
            onMouseEnter={() => setHoveredHotspot('shield')}
            onMouseLeave={() => setHoveredHotspot(null)}
            style={{ top: '38%', left: '52%', width: '28%', height: '26%' }}
            className={`absolute rounded-xl cursor-pointer transition-all active:scale-90 ${
              hoveredHotspot === 'shield'
                ? 'ring-2 ring-emerald-400 bg-emerald-400/30 scale-105'
                : 'hover:bg-emerald-400/20'
            }`}
            title="LASTMA Sec 44 Non-Commercial Certificate"
            aria-label="Open LASTMA Sec 44 Pass"
          >
            <span className="sr-only">LASTMA Pass</span>
          </button>

          <button
            onClick={() => handleAction('car')}
            onMouseEnter={() => setHoveredHotspot('car')}
            onMouseLeave={() => setHoveredHotspot(null)}
            style={{ top: '66%', left: '14%', width: '72%', height: '28%' }}
            className={`absolute rounded-xl cursor-pointer transition-all active:scale-95 ${
              hoveredHotspot === 'car'
                ? 'ring-2 ring-[#0F766E] bg-[#0F766E]/30 scale-102'
                : 'hover:bg-[#0F766E]/20'
            }`}
            title="Switch Between Rider and Driver Mode"
            aria-label="Toggle Rider or Driver Role"
          >
            <span className="sr-only">Switch Rider/Driver</span>
          </button>
        </div>

        {/* Logo Hardware Control Buttons */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold block px-0.5">
            1-TAP COCKPIT CONTROLS
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleAction('pin')}
              className="p-2.5 bg-slate-50 dark:bg-[#171F29] hover:bg-slate-100 dark:hover:bg-[#1E2936] border border-slate-200/80 dark:border-white/8 text-slate-900 dark:text-slate-100 rounded-xl font-bold flex items-center gap-2 transition-all active-press text-left"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="text-[11px]">01. Route Map</span>
            </button>

            <button
              onClick={() => handleAction('arrow')}
              className="p-2.5 bg-slate-50 dark:bg-[#171F29] hover:bg-slate-100 dark:hover:bg-[#1E2936] border border-slate-200/80 dark:border-white/8 text-slate-900 dark:text-slate-100 rounded-xl font-bold flex items-center gap-2 transition-all active-press text-left"
            >
              <Compass className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6] flex-shrink-0" />
              <span className="text-[11px]">
                02. {commuteDirection === 'morning' ? 'AM Outbound' : 'PM Return'}
              </span>
            </button>

            <button
              onClick={() => handleAction('circle')}
              className="p-2.5 bg-slate-50 dark:bg-[#171F29] hover:bg-slate-100 dark:hover:bg-[#1E2936] border border-slate-200/80 dark:border-white/8 text-slate-900 dark:text-slate-100 rounded-xl font-bold flex items-center gap-2 transition-all active-press text-left"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6] flex-shrink-0" />
              <span className="text-[11px]">03. Refresh Deck</span>
            </button>

            <button
              onClick={() => handleAction('shield')}
              className="p-2.5 bg-slate-50 dark:bg-[#171F29] hover:bg-slate-100 dark:hover:bg-[#1E2936] border border-slate-200/80 dark:border-white/8 text-slate-900 dark:text-slate-100 rounded-xl font-bold flex items-center gap-2 transition-all active-press text-left"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-[11px]">04. Sec 44 Pass</span>
            </button>
          </div>

          <button
            onClick={() => handleAction('car')}
            className="w-full py-2.5 px-3 btn-electric-mint rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all active-press"
          >
            <Car className="w-4 h-4" />
            <span>Switch to {activeRole === 'rider' ? 'Driver Console' : 'Rider Deck'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
