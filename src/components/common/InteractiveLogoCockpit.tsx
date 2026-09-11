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
  Sparkles,
  Volume2,
  VolumeX,
  ArrowLeft,
  Activity,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getAssetPath } from '@/lib/assets';
import { formatNgn } from '@/lib/utils';

// Lightweight browser Web Audio sound effects
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
  onOpenSafeZoneModal,
}) => {
  const {
    activeRole,
    setActiveRole,
    commuteDirection,
    toggleCommuteDirection,
    setActiveTab,
    resetDeck,
    selectedSafeZone,
    driverVehicle,
    offlinePin,
    escrowBalanceNgn,
  } = useAppStore();

  const [hoveredHotspot, setHoveredHotspot] = useState<HotspotId>(null);
  const [lastActionMessage, setLastActionMessage] = useState<string>(
    'Tap any symbol on the logo or use the buttons below to trigger corridor telemetry.'
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Browser back-button integration: popping state closes modal instead of closing the app
  useEffect(() => {
    if (!isOpen) return;

    // Push a history state so physical / swipe back navigates back a step
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
    // If modal pushed state, trigger browser back or close directly
    if (window.history.state?.modal === 'cockpit') {
      window.history.back();
    } else {
      onClose();
    }
  };

  const handleAction = (id: NonNullable<HotspotId>) => {
    if (soundEnabled) {
      if (id === 'pin') playCockpitTone(587, 'triangle', 0.15); // D5
      if (id === 'arrow') playCockpitTone(784, 'sine', 0.12);   // G5
      if (id === 'circle') playCockpitTone(659, 'sine', 0.12);  // E5
      if (id === 'shield') playCockpitTone(880, 'sine', 0.15);  // A5
      if (id === 'car') {
        playCockpitTone(440, 'sawtooth', 0.08); // A4
        setTimeout(() => playCockpitTone(880, 'sine', 0.12), 60);
      }
    }

    switch (id) {
      case 'pin':
        setLastActionMessage(
          `Navigating to Live Corridor Map with geofenced safe pickup zone: ${selectedSafeZone.name}.`
        );
        setActiveTab('map');
        onClose();
        break;

      case 'arrow':
        toggleCommuteDirection();
        const nextDir =
          commuteDirection === 'morning'
            ? 'Evening Return (VI → Ajah Marina Corridor)'
            : 'Morning Outbound (Ajah → Victoria Island Expressway)';
        setLastActionMessage(`Commute corridor switched to: ${nextDir}`);
        break;

      case 'circle':
        resetDeck();
        setActiveTab('deck');
        setLastActionMessage('Deck reloaded. Verified commuter queue refreshed.');
        break;

      case 'shield':
        setActiveTab('pass');
        setLastActionMessage(
          `Opening Lagos State Transport Sector Reform Act (Cap T1, Sec 44) Non-Commercial Certificate.`
        );
        onClose();
        break;

      case 'car':
        const nextRole = activeRole === 'rider' ? 'driver' : 'rider';
        setActiveRole(nextRole);
        setLastActionMessage(
          nextRole === 'driver'
            ? `Switched to DRIVER Mode: Vehicle ${driverVehicle.make} ${driverVehicle.model} (${driverVehicle.plate_number}).`
            : 'Switched to RIDER Mode: Commuter route searching active.'
        );
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#D97706', '#0D6E6E', '#7C3AED'],
        });
        break;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs overflow-y-auto p-2 sm:p-3 overscroll-contain">
      <div className="min-h-full flex items-center justify-center py-2">
        <div className="w-full max-w-[390px] bg-[#FAF8F3] rounded-3xl p-3.5 space-y-2.5 shadow-2xl border border-[#DDD4C5] my-auto animate-in zoom-in-95 duration-150">
          {/* Header with Back Button (Takes you back a step instead of closing app) */}
          <div className="flex items-center justify-between border-b border-[#DDD4C5] pb-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-[#141210] border border-[#DDD4C5] font-bold text-xs transition-all active:scale-95 shadow-2xs"
              title="Go back a step"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C25E2E]" />
              <span>Back</span>
            </button>

            <div className="text-center">
              <h3 className="text-sm font-serif font-black text-[#141210] tracking-tight">
                Logo Cockpit Console
              </h3>
              <span className="text-[10px] text-[#70665A] font-semibold block">
                Interactive Telemetry &amp; Hardware
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 transition-colors"
                title={soundEnabled ? 'Mute audio feedback' : 'Enable audio feedback'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#0D6E6E]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-stone-400" />
                )}
              </button>
              <button
                onClick={handleBack}
                className="w-7 h-7 rounded-full bg-white hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center border border-[#DDD4C5] transition-colors"
                title="Close console"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3D Interactive Logo Display with Calibrated Touch Hotspots */}
          <div className="relative w-36 h-36 mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-[#D97706]/15 via-[#0D6E6E]/15 to-[#C25E2E]/20 p-1 shadow-inner border border-[#C25E2E]/30 flex items-center justify-center">
            <img
              src={getAssetPath('/logo.png')}
              alt="CAR PULL Interactive Logo"
              className="w-full h-full object-contain select-none pointer-events-none rounded-xl drop-shadow-sm"
            />

          {/* HOTSPOT 1: Top-Left Orange Pin -> Safe Zones */}
          <button
            onClick={() => handleAction('pin')}
            onMouseEnter={() => setHoveredHotspot('pin')}
            onMouseLeave={() => setHoveredHotspot(null)}
            style={{ top: '10%', left: '20%', width: '28%', height: '26%' }}
            className={`absolute rounded-xl cursor-pointer transition-all active:scale-90 ${
              hoveredHotspot === 'pin'
                ? 'ring-3 ring-amber-400 bg-amber-400/35 shadow-md scale-105'
                : 'hover:bg-amber-400/25'
            }`}
            title="Safe Zones: Select CCTV Pickup Hub"
            aria-label="Select Pickup Safe Zone"
          >
            <span className="sr-only">Safe Zones</span>
          </button>

          {/* HOTSPOT 2: Top-Right Teal Box -> Toggle AM/PM Route */}
          <button
            onClick={() => handleAction('arrow')}
            onMouseEnter={() => setHoveredHotspot('arrow')}
            onMouseLeave={() => setHoveredHotspot(null)}
            style={{ top: '10%', left: '52%', width: '28%', height: '26%' }}
            className={`absolute rounded-xl cursor-pointer transition-all active:scale-90 ${
              hoveredHotspot === 'arrow'
                ? 'ring-3 ring-teal-400 bg-teal-400/35 shadow-md scale-105'
                : 'hover:bg-teal-400/25'
            }`}
            title="Toggle AM/PM Commute Corridor"
            aria-label="Toggle AM/PM Commute Route"
          >
            <span className="sr-only">Route Direction</span>
          </button>

          {/* HOTSPOT 3: Mid-Left White Ring 'C' -> Deck Reset */}
          <button
            onClick={() => handleAction('circle')}
            onMouseEnter={() => setHoveredHotspot('circle')}
            onMouseLeave={() => setHoveredHotspot(null)}
            style={{ top: '38%', left: '20%', width: '28%', height: '26%' }}
            className={`absolute rounded-xl cursor-pointer transition-all active:scale-90 ${
              hoveredHotspot === 'circle'
                ? 'ring-3 ring-cyan-300 bg-cyan-300/35 shadow-md scale-105'
                : 'hover:bg-cyan-300/25'
            }`}
            title="Corridor Matches: Reset & Refresh Deck"
            aria-label="Refresh Corridor Deck"
          >
            <span className="sr-only">Corridor Deck</span>
          </button>

          {/* HOTSPOT 4: Mid-Right Golden Shield -> LASTMA Sec 44 Pass */}
          <button
            onClick={() => handleAction('shield')}
            onMouseEnter={() => setHoveredHotspot('shield')}
            onMouseLeave={() => setHoveredHotspot(null)}
            style={{ top: '38%', left: '52%', width: '28%', height: '26%' }}
            className={`absolute rounded-xl cursor-pointer transition-all active:scale-90 ${
              hoveredHotspot === 'shield'
                ? 'ring-3 ring-yellow-400 bg-yellow-400/35 shadow-md scale-105'
                : 'hover:bg-yellow-400/25'
            }`}
            title="LASTMA Sec 44 Non-Commercial Certificate"
            aria-label="Open LASTMA Sec 44 Pass"
          >
            <span className="sr-only">LASTMA Pass</span>
          </button>

          {/* HOTSPOT 5: Bottom Golden Car -> Toggle Rider / Driver Mode */}
          <button
            onClick={() => handleAction('car')}
            onMouseEnter={() => setHoveredHotspot('car')}
            onMouseLeave={() => setHoveredHotspot(null)}
            style={{ top: '66%', left: '14%', width: '72%', height: '28%' }}
            className={`absolute rounded-xl cursor-pointer transition-all active:scale-95 ${
              hoveredHotspot === 'car'
                ? 'ring-3 ring-[#0D6E6E] bg-[#0D6E6E]/30 shadow-md scale-102'
                : 'hover:bg-[#0D6E6E]/20'
            }`}
            title="Switch Between Rider and Driver Mode"
            aria-label="Toggle Rider or Driver Role"
          >
            <span className="sr-only">Switch Rider/Driver</span>
          </button>
        </div>

        {/* Logo Hardware Control Buttons */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-[#70665A] uppercase tracking-wider font-extrabold block px-0.5">
            1-Tap Hardware Shortcuts:
          </span>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => handleAction('pin')}
              className="p-2 bg-white hover:bg-amber-50 text-[#141210] rounded-xl font-bold flex items-center gap-1.5 border border-[#DDD5C7] transition-all active:scale-95 text-left shadow-2xs"
            >
              <MapPin className="w-3.5 h-3.5 text-[#C25E2E] flex-shrink-0" />
              <span className="text-[11px]">1. Route Map</span>
            </button>

            <button
              onClick={() => handleAction('arrow')}
              className="p-2 bg-white hover:bg-teal-50 text-[#141210] rounded-xl font-bold flex items-center gap-1.5 border border-[#DDD5C7] transition-all active:scale-95 text-left shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 text-[#0D6E6E] flex-shrink-0" />
              <span className="text-[11px]">2. AM/PM Route</span>
            </button>

            <button
              onClick={() => handleAction('circle')}
              className="p-2 bg-white hover:bg-cyan-50 text-[#141210] rounded-xl font-bold flex items-center gap-1.5 border border-[#DDD5C7] transition-all active:scale-95 text-left shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-700 flex-shrink-0" />
              <span className="text-[11px]">3. Refresh Deck</span>
            </button>

            <button
              onClick={() => handleAction('shield')}
              className="p-2 bg-white hover:bg-emerald-50 text-[#141210] rounded-xl font-bold flex items-center gap-1.5 border border-[#DDD5C7] transition-all active:scale-95 text-left shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              <span className="text-[11px]">4. Sec 44 Pass</span>
            </button>
          </div>

          <button
            onClick={() => handleAction('car')}
            className="w-full p-2.5 bg-[#0D6E6E] hover:bg-[#094E4E] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-xs"
          >
            <Car className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>Switch to {activeRole === 'rider' ? 'Driver Mode' : 'Rider Mode'}</span>
          </button>
        </div>
      </div>
    </div>
  </div>,
  document.body
);
};
