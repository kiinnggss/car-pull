'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { useAppStore } from '@/lib/store/useAppStore';
import { ProfileCard } from './ProfileCard';
import { QuickBidPills } from './QuickBidPills';
import { RoutePlannerBar } from './RoutePlannerBar';
import { RefreshCw, CheckCircle, Sparkles, Calendar, ArrowLeft, X } from 'lucide-react';
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
        colors: ['#0D6E6E', '#C25E2E', '#7C3AED', '#D97706'],
      });
    });

    swipeRight();
  };

  const hasCardsLeft = currentDriver !== null && activeDriverIndex < drivers.length;

  return (
    <div className="flex flex-col items-center w-full max-w-[390px] mx-auto pb-20 px-3 space-y-2">
      {/* Unified Transit Console (Route + Safe Hub integrated seamlessly) */}
      <RoutePlannerBar />

      {/* Tinder-Style Framer Motion Swipeable Card Deck (Dense 350px) */}
      <div className="relative w-full h-[350px] flex items-center justify-center">
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
              {/* Dynamic Overlay Stamp: ACCEPT RIDE (Teal) */}
              <motion.div
                style={{ opacity: acceptStampOpacity }}
                className="absolute top-5 left-5 z-30 pointer-events-none transform -rotate-12 border-2 border-[#0D6E6E] text-[#0D6E6E] font-black text-sm px-2.5 py-0.5 rounded-lg bg-white shadow-lg tracking-wider uppercase"
              >
                ACCEPT RIDE
              </motion.div>

              {/* Dynamic Overlay Stamp: PASS (Red) */}
              <motion.div
                style={{ opacity: passStampOpacity }}
                className="absolute top-5 right-5 z-30 pointer-events-none transform rotate-12 border-2 border-red-600 text-red-600 font-black text-sm px-2.5 py-0.5 rounded-lg bg-white shadow-lg tracking-wider uppercase"
              >
                PASS
              </motion.div>

              <ProfileCard driver={currentDriver} safeZone={selectedSafeZone} />
            </motion.div>
          ) : (
            /* Empty State Deck */
            <div className="w-full h-full rounded-2xl bg-white border border-[#DDD4C5] flex flex-col items-center justify-center p-5 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0D6E6E]">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-serif font-black text-[#141210]">All Commuters Reviewed</h3>
                <p className="text-[11px] text-[#70665A] max-w-[240px] mx-auto">
                  No more active drivers on the Ajah → VI corridor for this commute window.
                </p>
              </div>
              <button
                onClick={resetDeck}
                className="flex items-center gap-1.5 bg-[#0D6E6E] hover:bg-[#094E4E] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Deck</span>
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Flowing Unified Action & Cost Audit Console (Directly below Card, Never Offscreen) */}
      {hasCardsLeft && (
        <QuickBidPills onAccept={triggerAccept} onPass={swipeLeft} />
      )}

      {/* Match Confirmation Modal with Back Button */}
      {lastMatchedDriver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[340px] bg-[#FAF8F3] rounded-2xl p-4 text-center space-y-3 shadow-2xl border border-[#DDD5C7]">
            <div className="flex items-center justify-between border-b border-[#DDD5C7] pb-2">
              <button
                onClick={() => setLastMatchedDriver(null)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-[#DDD5C7] text-xs font-bold text-[#141210] shadow-2xs"
              >
                <ArrowLeft className="w-3 h-3 text-[#C25E2E]" />
                <span>Back</span>
              </button>
              <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Matched & Escrow Held
              </span>
              <button
                onClick={() => setLastMatchedDriver(null)}
                className="p-1 rounded-lg text-stone-500 hover:text-stone-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-serif font-black text-[#141210]">
                Matched with {lastMatchedDriver.name}!
              </h3>
              <div className="flex items-center justify-center gap-1.5 py-0.5">
                <span className="text-xs font-bold text-[#141210]">
                  {lastMatchedDriver.vehicle.make} {lastMatchedDriver.vehicle.model}
                </span>
                <span className="font-mono text-[10px] font-black text-[#0D6E6E] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  {lastMatchedDriver.vehicle.plate_number}
                </span>
              </div>
              <p className="text-[11px] text-[#70665A]">
                Escrow hold of <strong>{formatNgn(customBidNgn)}</strong> secured.
              </p>
            </div>

            {/* Commute Lock Option */}
            <div className="bg-white border border-[#DDD4C5] rounded-xl p-2.5 text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#141210] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#0D6E6E]" />
                  Lock Mon–Fri Routine
                </span>
                <button
                  onClick={() => {
                    lockWeeklyCommute(lastMatchedDriver.id);
                    setLastMatchedDriver(null);
                  }}
                  className="text-[10px] font-bold bg-[#0D6E6E] text-white px-2 py-0.5 rounded-md"
                >
                  Lock Routine
                </button>
              </div>
              <p className="text-[9px] text-[#70665A] leading-tight">
                Auto-reserves daily seat at {lastMatchedDriver.corridor.departure_time} with daily escrow release.
              </p>
            </div>

            <button
              onClick={() => setLastMatchedDriver(null)}
              className="w-full py-2 bg-[#ECE5D8] hover:bg-[#DDD4C5] text-[#141210] font-bold text-xs rounded-xl transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
