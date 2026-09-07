'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { useAppStore } from '@/lib/store/useAppStore';
import { ProfileCard } from './ProfileCard';
import { QuickBidPills } from './QuickBidPills';
import { FairShareIndicator } from './FairShareIndicator';
import { SafeZoneSelector } from './SafeZoneSelector';
import { RefreshCw, MapPin, CheckCircle, Sparkles, Calendar, Navigation } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatNgn } from '@/lib/utils';

export const SwipeDeck: React.FC = () => {
  const {
    activeRole,
    commuteDirection,
    drivers,
    activeDriverIndex,
    currentDriver,
    selectedSafeZone,
    customBidNgn,
    swipeLeft,
    swipeRight,
    resetDeck,
    lockWeeklyCommute,
    setActiveTab,
  } = useAppStore();

  const [showSafeZoneModal, setShowSafeZoneModal] = useState(false);
  const [lastMatchedDriver, setLastMatchedDriver] = useState<any | null>(null);

  // Framer Motion Drag values - GPU accelerated
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.6, 1, 1, 1, 0.6]);

  const acceptStampOpacity = useTransform(x, [40, 110], [0, 1]);
  const passStampOpacity = useTransform(x, [-40, -110], [0, 1]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;
    const velocityThreshold = 400;

    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      triggerAccept();
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      swipeLeft();
    }
  };

  const triggerAccept = () => {
    if (!currentDriver) return;
    const matched = currentDriver;
    setLastMatchedDriver(matched);

    // Trigger confetti without blocking UI thread
    requestAnimationFrame(() => {
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.65 },
        colors: ['#7C3AED', '#A855F7', '#10B981', '#F59E0B'],
      });
    });

    swipeRight();
  };

  const hasCardsLeft = currentDriver !== null && activeDriverIndex < drivers.length;

  return (
    <div className="flex flex-col items-center w-full max-w-[390px] mx-auto pb-24 px-3 space-y-2.5">
      {/* Seamless Integrated Safe Zone Filter Pill & Live Map Switcher */}
      <div className="w-full flex items-center justify-between gap-1.5">
        <div className="flex-1 flex items-center justify-between bg-zinc-50 border border-zinc-200/80 rounded-2xl px-3 py-1.5 text-xs shadow-2xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <MapPin className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
            <div className="truncate">
              <span className="text-[9px] text-zinc-400 block font-semibold uppercase tracking-wider leading-none">
                Safe Zone
              </span>
              <span className="font-bold text-zinc-800 truncate block text-[11px] leading-tight">
                {selectedSafeZone.name}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowSafeZoneModal(true)}
            className="text-xs font-bold text-[#7C3AED] hover:underline px-1.5 py-0.5 rounded-lg flex-shrink-0 ml-1"
          >
            Change
          </button>
        </div>

        {/* Quick Switch to Live Map */}
        <button
          onClick={() => setActiveTab('map')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-xs font-black shadow-xs hover:shadow-sm active:scale-95 transition-all flex-shrink-0"
          title="Open interactive Lagos Corridor Map"
        >
          <Navigation className="w-3.5 h-3.5 text-amber-300" />
          <span>Live Map</span>
        </button>
      </div>

      {/* Tinder-Style Framer Motion Swipeable Card Deck */}
      <div className="relative w-full h-[495px] flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {hasCardsLeft ? (
            <motion.div
              key={currentDriver.id}
              style={{ x, rotate, opacity }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.65}
              onDragEnd={handleDragEnd}
              transition={{
                type: 'spring',
                damping: 24,
                stiffness: 320,
              }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none z-20 transform-gpu will-change-transform"
            >
              {/* Dynamic Overlay Stamp: ACCEPT RIDE (Green) */}
              <motion.div
                style={{ opacity: acceptStampOpacity }}
                className="absolute top-8 left-8 z-30 pointer-events-none transform -rotate-12 border-3 border-emerald-600 text-emerald-700 font-black text-xl px-3 py-1 rounded-xl bg-white shadow-xl tracking-wider uppercase"
              >
                ACCEPT RIDE
              </motion.div>

              {/* Dynamic Overlay Stamp: PASS (Red) */}
              <motion.div
                style={{ opacity: passStampOpacity }}
                className="absolute top-8 right-8 z-30 pointer-events-none transform rotate-12 border-3 border-red-600 text-red-600 font-black text-xl px-3 py-1 rounded-xl bg-white shadow-xl tracking-wider uppercase"
              >
                PASS
              </motion.div>

              <ProfileCard driver={currentDriver} safeZone={selectedSafeZone} />
            </motion.div>
          ) : (
            /* Empty State Deck */
            <div className="w-full h-full rounded-3xl bg-white border border-zinc-100 flex flex-col items-center justify-center p-6 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-[#7C3AED]">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-zinc-900">All Commuters Reviewed</h3>
                <p className="text-xs text-zinc-500 max-w-[240px] mx-auto">
                  No more active drivers on the Ajah ➔ VI corridor for this window.
                </p>
              </div>
              <button
                onClick={resetDeck}
                className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Deck</span>
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Fair Share Indicator & Quick Bid Control Chips */}
      {hasCardsLeft && (
        <div className="w-full space-y-2">
          <FairShareIndicator
            distanceKm={currentDriver.corridor.distance_km || 26.5}
            currentBidNgn={customBidNgn}
            seats={currentDriver.corridor.available_seats || 3}
            hasAc={currentDriver.vehicle.has_ac}
          />
          <QuickBidPills onAccept={triggerAccept} onPass={swipeLeft} />
        </div>
      )}

      {/* Safe Zone Modal Picker - Lightweight Overlay */}
      {showSafeZoneModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-[390px] bg-white rounded-3xl p-4 space-y-3.5 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
              <h3 className="text-sm font-black text-zinc-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#7C3AED]" />
                Geofenced Safe-Zone Pickups
              </h3>
              <button
                onClick={() => setShowSafeZoneModal(false)}
                className="text-xs text-zinc-400 hover:text-zinc-800 px-2 py-1 rounded-lg font-bold"
              >
                ✕
              </button>
            </div>
            <SafeZoneSelector />
            <button
              onClick={() => setShowSafeZoneModal(false)}
              className="w-full py-3 bg-[#7C3AED] text-white font-bold text-xs rounded-xl shadow-xs active:scale-95"
            >
              Confirm Safe Zone Hub
            </button>
          </div>
        </div>
      )}

      {/* Match Confirmation Modal */}
      {lastMatchedDriver && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[340px] bg-white rounded-3xl p-5 text-center space-y-3.5 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Ride Matched & Escrow Held
              </span>
              <h3 className="text-base font-black text-zinc-900">
                Matched with {lastMatchedDriver.name}!
              </h3>
              <p className="text-xs text-zinc-500">
                Seat reserved on <strong>{lastMatchedDriver.vehicle.make}</strong>.
                Escrow hold of <strong>{formatNgn(customBidNgn)}</strong> secured.
              </p>
            </div>

            {/* Commute Lock Option for Mon-Fri */}
            <div className="bg-zinc-50 rounded-2xl p-3 text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#7C3AED]" />
                  Lock Mon–Fri Routine
                </span>
                <button
                  onClick={() => {
                    lockWeeklyCommute(lastMatchedDriver.id);
                    setLastMatchedDriver(null);
                  }}
                  className="text-[10px] font-bold bg-[#7C3AED] text-white px-2.5 py-1 rounded-lg"
                >
                  Lock Routine
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 leading-tight">
                Auto-reserves daily seat at {lastMatchedDriver.corridor.departure_time} with daily 6:00 AM escrow release.
              </p>
            </div>

            <button
              onClick={() => setLastMatchedDriver(null)}
              className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
