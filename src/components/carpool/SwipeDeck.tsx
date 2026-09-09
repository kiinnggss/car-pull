'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { useAppStore } from '@/lib/store/useAppStore';
import { ProfileCard } from './ProfileCard';
import { QuickBidPills } from './QuickBidPills';
import { FairShareIndicator } from './FairShareIndicator';
import { SafeZoneSelector } from './SafeZoneSelector';
import { RoutePlannerBar } from './RoutePlannerBar';
import { RefreshCw, MapPin, CheckCircle, Sparkles, Calendar, ShieldCheck, X } from 'lucide-react';
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
  } = useAppStore();

  const [showSafeZoneModal, setShowSafeZoneModal] = useState(false);
  const [lastMatchedDriver, setLastMatchedDriver] = useState<any | null>(null);

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

    requestAnimationFrame(() => {
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.65 },
        colors: ['#7C3AED', '#A855F7', '#10B981', '#F59E0B'],
      });
    });

    swipeRight();
  };

  const hasCardsLeft = currentDriver !== null && activeDriverIndex < drivers.length;

  return (
    <div className="flex flex-col items-center w-full max-w-[390px] mx-auto pb-20 px-3 space-y-2">
      {/* Custom Origin & Destination Route Planner */}
      <RoutePlannerBar />

      {/* Clean Single CCTV Safe Zone Hub Indicator */}
      <div
        onClick={() => setShowSafeZoneModal(true)}
        className="w-full flex items-center justify-between bg-white hover:bg-[#F4F0E8] border border-[#E7E2D8] rounded-xl px-3 py-1.5 text-xs shadow-2xs cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <div className="truncate">
            <span className="text-[9px] text-[#78716C] block font-semibold uppercase tracking-wider leading-none">
              Off-Street Safe Pickup Hub
            </span>
            <span className="font-bold text-[#1C1917] truncate block text-[11px] leading-tight mt-0.5">
              {selectedSafeZone.name}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#7C3AED] px-2 py-0.5 rounded-md bg-purple-50 flex-shrink-0 border border-purple-100">
          Change
        </span>
      </div>

      {/* Tinder-Style Framer Motion Swipeable Card Deck (Dense 360px) */}
      <div className="relative w-full h-[360px] flex items-center justify-center">
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
                className="absolute top-6 left-6 z-30 pointer-events-none transform -rotate-12 border-2 border-emerald-600 text-emerald-700 font-black text-base px-2.5 py-0.5 rounded-lg bg-white shadow-lg tracking-wider uppercase"
              >
                ACCEPT RIDE
              </motion.div>

              {/* Dynamic Overlay Stamp: PASS (Red) */}
              <motion.div
                style={{ opacity: passStampOpacity }}
                className="absolute top-6 right-6 z-30 pointer-events-none transform rotate-12 border-2 border-red-600 text-red-600 font-black text-base px-2.5 py-0.5 rounded-lg bg-white shadow-lg tracking-wider uppercase"
              >
                PASS
              </motion.div>

              <ProfileCard driver={currentDriver} safeZone={selectedSafeZone} />
            </motion.div>
          ) : (
            /* Empty State Deck */
            <div className="w-full h-full rounded-2xl bg-white border border-[#E7E2D8] flex flex-col items-center justify-center p-5 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-[#7C3AED]">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-[#1C1917]">All Commuters Reviewed</h3>
                <p className="text-[11px] text-[#78716C] max-w-[240px] mx-auto">
                  No more active drivers on the Ajah → VI corridor for this commute window.
                </p>
              </div>
              <button
                onClick={resetDeck}
                className="flex items-center gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Deck</span>
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Primary Mobile Action Buttons (Directly below Card, Always in Viewport) */}
      {hasCardsLeft && (
        <div className="w-full space-y-1.5">
          <QuickBidPills onAccept={triggerAccept} onPass={swipeLeft} />
          <FairShareIndicator
            distanceKm={currentDriver.corridor.distance_km || 26.5}
            currentBidNgn={customBidNgn}
            seats={currentDriver.corridor.available_seats || 3}
            hasAc={currentDriver.vehicle.has_ac}
          />
        </div>
      )}

      {/* Safe Zone Modal Picker */}
      {showSafeZoneModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-[390px] bg-white rounded-2xl p-4 space-y-3 max-h-[85vh] overflow-y-auto shadow-2xl border border-[#E7E2D8]">
            <div className="flex items-center justify-between border-b border-[#E7E2D8] pb-2">
              <h3 className="text-xs font-black text-[#1C1917] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#7C3AED]" />
                Geofenced Safe-Zone Pickups
              </h3>
              <button
                onClick={() => setShowSafeZoneModal(false)}
                className="p-1 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#F4F0E8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <SafeZoneSelector />
            <button
              onClick={() => setShowSafeZoneModal(false)}
              className="w-full py-2.5 bg-[#7C3AED] text-white font-bold text-xs rounded-xl shadow-xs active:scale-95"
            >
              Confirm Safe Zone Hub
            </button>
          </div>
        </div>
      )}

      {/* Match Confirmation Modal */}
      {lastMatchedDriver && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[340px] bg-white rounded-2xl p-4 text-center space-y-3 shadow-2xl border border-[#E7E2D8]">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Ride Matched & Escrow Held
              </span>
              <h3 className="text-sm font-black text-[#1C1917]">
                Matched with {lastMatchedDriver.name}!
              </h3>
              <div className="flex items-center justify-center gap-1.5 py-0.5">
                <span className="text-xs font-bold text-[#1C1917]">
                  {lastMatchedDriver.vehicle.make} {lastMatchedDriver.vehicle.model}
                </span>
                <span className="font-mono text-[10px] font-black text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  {lastMatchedDriver.vehicle.plate_number}
                </span>
              </div>
              <p className="text-[11px] text-[#78716C]">
                Escrow hold of <strong>{formatNgn(customBidNgn)}</strong> secured.
              </p>
            </div>

            {/* Commute Lock Option for Mon-Fri */}
            <div className="bg-[#FAF8F5] border border-[#E7E2D8] rounded-xl p-2.5 text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C1917] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#7C3AED]" />
                  Lock Mon–Fri Routine
                </span>
                <button
                  onClick={() => {
                    lockWeeklyCommute(lastMatchedDriver.id);
                    setLastMatchedDriver(null);
                  }}
                  className="text-[10px] font-bold bg-[#7C3AED] text-white px-2 py-0.5 rounded-md"
                >
                  Lock Routine
                </button>
              </div>
              <p className="text-[9px] text-[#78716C] leading-tight">
                Auto-reserves daily seat at {lastMatchedDriver.corridor.departure_time} with daily escrow release.
              </p>
            </div>

            <button
              onClick={() => setLastMatchedDriver(null)}
              className="w-full py-2 bg-[#F4F0E8] hover:bg-[#E7E2D8] text-[#1C1917] font-bold text-xs rounded-xl transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
