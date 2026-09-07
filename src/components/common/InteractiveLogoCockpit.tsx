'use client';

import React, { useState } from 'react';
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
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Lightweight, zero-dependency browser Web Audio sound effects
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
    // Silently ignore if audio context is restricted
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
  } = useAppStore();

  const [hoveredHotspot, setHoveredHotspot] = useState<HotspotId>(null);
  const [lastActionMessage, setLastActionMessage] = useState<string>('Tap any button on the 3D logo');
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (!isOpen) return null;

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
        setLastActionMessage(`📍 Safe Zones: Opening hub selector (Active: ${selectedSafeZone.name})`);
        if (onOpenSafeZoneModal) {
          onClose();
          onOpenSafeZoneModal();
        } else {
          setActiveTab('deck');
        }
        break;

      case 'arrow':
        toggleCommuteDirection();
        const nextDir = commuteDirection === 'morning' ? 'Evening Return (VI ➔ Ajah)' : 'Morning Outbound (Ajah ➔ VI)';
        setLastActionMessage(`🔁 Switched Route to: ${nextDir}`);
        break;

      case 'circle':
        resetDeck();
        setActiveTab('deck');
        setLastActionMessage('🔄 Corridor Deck refreshed to top driver');
        break;

      case 'shield':
        setActiveTab('pass');
        setLastActionMessage('🛡️ Opening LASTMA Sec 44 Anti-Extortion Pass');
        onClose();
        break;

      case 'car':
        const nextRole = activeRole === 'rider' ? 'driver' : 'rider';
        setActiveRole(nextRole);
        setLastActionMessage(
          nextRole === 'driver'
            ? `🚗 Switched to DRIVER Mode (${driverVehicle.plate_number})`
            : '🎒 Switched to RIDER Mode'
        );
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#7C3AED'],
        });
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-[370px] bg-white rounded-3xl p-4.5 space-y-3.5 shadow-2xl border border-zinc-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-purple-100 text-[#7C3AED]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-900">CAR PULL Interactive Cockpit</h3>
              <span className="text-[10px] text-zinc-400 font-medium">
                Hardware Touch Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 transition-colors"
              title={soundEnabled ? 'Mute UI sounds' : 'Enable UI sounds'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold text-xs flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3D Interactive Logo Display with Clickable Hotspots */}
        <div className="relative w-full aspect-square max-w-[290px] mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500/20 via-teal-500/10 to-amber-700/20 p-2 shadow-inner border border-zinc-200/80">
          <img
            src="/logo.png"
            alt="CAR PULL Interactive Logo"
            className="w-full h-full object-contain select-none pointer-events-none rounded-2xl drop-shadow-md"
          />

          {/* HOTSPOT 1: Top-Left Orange Map Pin -> Safe Zones */}
          <button
            onClick={() => handleAction('pin')}
            onMouseEnter={() => setHoveredHotspot('pin')}
            onMouseLeave={() => setHoveredHotspot(null)}
            style={{ top: '22.5%', left: '32%', width: '15.5%', height: '16.5%' }}
            className={`absolute rounded-2xl cursor-pointer transition-all active:scale-90 ${
              hoveredHotspot === 'pin'
                ? 'ring-4 ring-amber-400 bg-amber-400/30 shadow-lg scale-105'
                : 'hover:bg-amber-400/20'
            }`}
            title="Safe Zones: Select CCTV Pickup Hub"
            aria-label="Select Pickup Safe Zone"
          >
            <span className="sr-only">Safe Zones</span>
          </button>

          {/* HOTSPOT 2: Top-Right Teal Arrow -> Toggle AM/PM Route */}
          <button
            onClick={() => handleAction('arrow')}
            onMouseEnter={() => setHoveredHotspot('arrow')}
            onMouseLeave={() => setHoveredHotspot(null)}
            style={{ top: '22.5%', left: '56%', width: '15.5%', height: '16.5%' }}
            className={`absolute rounded-2xl cursor-pointer transition-all active:scale-90 ${
              hoveredHotspot === 'arrow'
                ? 'ring-4 ring-teal-400 bg-teal-400/30 shadow-lg scale-105'
                : 'hover:bg-teal-400/20'
            }`}
            title="Commute Direction: Toggle Morning/Evening"
            aria-label="Toggle AM/PM Commute Route"
          >
            <span className="sr-only">Route Direction</span>
          </button>

          {/* HOTSPOT 3: Bottom-Left White 'C' / Speedometer -> Deck & Reset */}
          <button
            onClick={() => handleAction('circle')}
            onMouseEnter={() => setHoveredHotspot('circle')}
            onMouseLeave={() => setHoveredHotspot(null)}
            style={{ top: '42%', left: '32%', width: '15.5%', height: '16%' }}
            className={`absolute rounded-full cursor-pointer transition-all active:scale-90 ${
              hoveredHotspot === 'circle'
                ? 'ring-4 ring-cyan-300 bg-cyan-300/30 shadow-lg scale-105'
                : 'hover:bg-white/20'
            }`}
            title="Corridor Matches: Reset & Refresh Deck"
            aria-label="Refresh Corridor Deck"
          >
            <span className="sr-only">Corridor Deck</span>
          </button>

          {/* HOTSPOT 4: Bottom-Right Golden Shield -> LASTMA Sec 44 Pass */}
          <button
            onClick={() => handleAction('shield')}
            onMouseEnter={() => setHoveredHotspot('shield')}
            onMouseLeave={() => setHoveredHotspot(null)}
            style={{ top: '41%', left: '56.5%', width: '15.5%', height: '17%' }}
            className={`absolute rounded-2xl cursor-pointer transition-all active:scale-90 ${
              hoveredHotspot === 'shield'
                ? 'ring-4 ring-yellow-400 bg-yellow-400/30 shadow-lg scale-105'
                : 'hover:bg-yellow-400/20'
            }`}
            title="LASTMA Sec 44 Non-Commercial Pass"
            aria-label="Open LASTMA Sec 44 Pass"
          >
            <span className="sr-only">LASTMA Pass</span>
          </button>

          {/* HOTSPOT 5: Bottom Golden Car -> Toggle Rider / Driver Mode */}
          <button
            onClick={() => handleAction('car')}
            onMouseEnter={() => setHoveredHotspot('car')}
            onMouseLeave={() => setHoveredHotspot(null)}
            style={{ top: '59%', left: '25.5%', width: '49%', height: '15%' }}
            className={`absolute rounded-2xl cursor-pointer transition-all active:scale-95 ${
              hoveredHotspot === 'car'
                ? 'ring-4 ring-purple-400 bg-purple-400/30 shadow-lg scale-102'
                : 'hover:bg-purple-400/20'
            }`}
            title="Toggle Role: Rider ⇄ Driver"
            aria-label="Toggle Rider or Driver Role"
          >
            <span className="sr-only">Switch Rider/Driver</span>
          </button>
        </div>

        {/* Dynamic LCD Action Feedback HUD */}
        <div className="bg-zinc-900 rounded-2xl p-3 text-white space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between text-[10px] text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              COCKPIT TELEMETRY
            </span>
            <span>{hoveredHotspot ? `HOVER: [${hoveredHotspot.toUpperCase()}]` : 'READY'}</span>
          </div>

          <p className="text-emerald-300 text-[11px] font-bold truncate">
            {lastActionMessage}
          </p>

          <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800">
            <span>Role: <strong className="text-white uppercase">{activeRole}</strong></span>
            <span>Dir: <strong className="text-white uppercase">{commuteDirection}</strong></span>
            <span>Hub: <strong className="text-white">{selectedSafeZone.name.split(' ')[0]}</strong></span>
          </div>
        </div>

        {/* Explicit Touch Function Chips (Accessibility & Quick Actions) */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block px-1">
            Logo Hardware Controls:
          </span>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              onClick={() => handleAction('pin')}
              className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl font-bold flex items-center gap-1.5 transition-colors text-left"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span className="truncate">1. Safe Zone Hub</span>
            </button>

            <button
              onClick={() => handleAction('arrow')}
              className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-xl font-bold flex items-center gap-1.5 transition-colors text-left"
            >
              <Compass className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
              <span className="truncate">2. AM/PM Route</span>
            </button>

            <button
              onClick={() => handleAction('circle')}
              className="p-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 rounded-xl font-bold flex items-center gap-1.5 transition-colors text-left"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
              <span className="truncate">3. Deck & Reset</span>
            </button>

            <button
              onClick={() => handleAction('shield')}
              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl font-bold flex items-center gap-1.5 transition-colors text-left"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">4. LASTMA Pass</span>
            </button>
          </div>

          <button
            onClick={() => handleAction('car')}
            className="w-full p-2.5 bg-purple-50 hover:bg-purple-100 text-[#7C3AED] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors mt-1"
          >
            <Car className="w-4 h-4" />
            <span>5. Car Profile: Switch to {activeRole === 'rider' ? 'Driver' : 'Rider'} Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};
