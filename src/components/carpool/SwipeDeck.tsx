'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { useAppStore } from '@/lib/store/useAppStore';
import { ProfileCard } from './ProfileCard';
import { QuickBidPills } from './QuickBidPills';
import { RoutePlannerBar } from './RoutePlannerBar';
import { RefreshCw, Sparkles, ArrowLeft, X, MessageCircle, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatNgn } from '@/lib/utils';
import { IcebreakerChatModal } from './IcebreakerChatModal';
import { triggerHaptic } from '@/lib/haptics';

export const SwipeDeck: React.FC = () => {
  const {
    drivers,
    activeDriverIndex,
    currentDriver,
    selectedSafeZone,
    customBidNgn,
    swipeLeft,
    swipeRight,
    resetDeck,
  } = useAppStore();

  const [lastMatchedDriver, setLastMatchedDriver] = useState<any | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.65, 1, 1, 1, 0.65]);

  const acceptStampOpacity = useTransform(x, [40, 110], [0, 1]);
  const passStampOpacity = useTransform(x, [-40, -110], [0, 1]);

  useEffect(() => {
    let hasTicked = false;
    const unsubscribe = x.on('change', (latest) => {
      if (Math.abs(latest) > 85 && !hasTicked) {
        triggerHaptic('tick');
        hasTicked = true;
      } else if (Math.abs(latest) <= 85) {
        hasTicked = false;
      }
    });
    return () => unsubscribe();
  }, [x]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;
    const velocityThreshold = 400;

    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      triggerAccept();
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      triggerPass();
    }
  };

  const triggerPass = () => {
    triggerHaptic('tap');
    swipeLeft();
  };

  const triggerAccept = () => {
    if (!currentDriver) return;
    const matched = currentDriver;
    setLastMatchedDriver(matched);
    triggerHaptic('match');

    requestAnimationFrame(() => {
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.65 },
        colors: ['#0F766E', '#D97706', '#14B8A6'],
      });
    });

    swipeRight();
  };

  const hasCardsLeft = currentDriver !== null && activeDriverIndex < drivers.length;

  return (
    <div className="flex-1 flex flex-col justify-between w-full max-w-[400px] mx-auto px-3 h-full min-h-0 overflow-hidden py-1 gap-1.5">
      {/* Top: Transit Corridor Bar */}
      <div className="w-full flex-shrink-0">
        <RoutePlannerBar />
      </div>

      {/* Center: Swipeable Profile Card Deck */}
      <div className="relative w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden">
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
                damping: 26,
                stiffness: 340,
              }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none z-20 transform-gpu will-change-transform"
            >
              {/* Dynamic Stamp: RESERVE SEAT */}
              <motion.div
                style={{ opacity: acceptStampOpacity }}
                className="absolute top-14 left-4 z-30 pointer-events-none transform -rotate-12 text-[#0F766E] dark:text-[#14B8A6] font-extrabold text-xs px-3 py-1 rounded-lg bg-white/95 dark:bg-[#090D11]/95 border-2 border-[#0F766E] dark:border-[#14B8A6] tracking-wider uppercase"
              >
                RESERVE SEAT
              </motion.div>

              {/* Dynamic Stamp: PASS */}
              <motion.div
                style={{ opacity: passStampOpacity }}
                className="absolute top-14 right-4 z-30 pointer-events-none transform rotate-12 text-rose-600 dark:text-rose-400 font-extrabold text-xs px-3 py-1 rounded-lg bg-white/95 dark:bg-[#090D11]/95 border-2 border-rose-600 dark:border-rose-400 tracking-wider uppercase"
              >
                PASS
              </motion.div>

              <ProfileCard driver={currentDriver} safeZone={selectedSafeZone} />
            </motion.div>
          ) : (
            /* Empty State Deck */
            <div className="w-full h-full min-h-[280px] rounded-2xl floating-surface flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Corridor Queue Reviewed
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto">
                  You have reviewed all verified drivers currently departing along this corridor.
                </p>
              </div>
              <button
                onClick={resetDeck}
                className="flex items-center gap-1.5 btn-electric-mint text-xs px-4 py-2.5 rounded-xl active-spring"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Corridor Queue</span>
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom: Fuel Split Stepper & Decision Console */}
      {hasCardsLeft && (
        <div className="w-full flex-shrink-0">
          <QuickBidPills onAccept={triggerAccept} onPass={swipeLeft} />
        </div>
      )}

      {/* Match Confirmation Modal */}
      {lastMatchedDriver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[360px] floating-surface rounded-2xl p-4 text-center space-y-3.5 shadow-floating-lg dark:shadow-floating-dark-lg">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/8">
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setLastMatchedDriver(null);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 active-spring"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Back</span>
              </button>
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                ESCROW SECURED
              </span>
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setLastMatchedDriver(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white active-spring"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
                <img
                  src={lastMatchedDriver.avatar}
                  alt={lastMatchedDriver.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Seat Reserved with {lastMatchedDriver.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Escrow hold of <strong className="font-mono tabular-nums text-slate-900 dark:text-white">{formatNgn(customBidNgn)}</strong> locked for pickup.
                </p>
              </div>

              {/* Telemetry Summary Box */}
              <div className="bg-slate-50 dark:bg-[#090D11] border border-slate-200/80 dark:border-white/8 rounded-xl divide-y divide-slate-200/70 dark:divide-white/8 text-left text-xs">
                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Vehicle</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {lastMatchedDriver.vehicle.make} {lastMatchedDriver.vehicle.model}
                    </span>
                    <span className="plate-badge text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {lastMatchedDriver.vehicle.plate_number}
                    </span>
                  </div>
                </div>

                {lastMatchedDriver.trip_purpose && (
                  <div className="px-3 py-2 flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                    <Compass className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6] flex-shrink-0" />
                    <span className="truncate font-medium">{lastMatchedDriver.trip_purpose}</span>
                  </div>
                )}

                {lastMatchedDriver.cabin_passengers && lastMatchedDriver.cabin_passengers.length > 0 && (
                  <div className="px-3 py-2 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                      Co-Riders Onboard
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {lastMatchedDriver.cabin_passengers.map((p: any) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-1 bg-white dark:bg-[#141C24] border border-slate-200/70 dark:border-white/8 px-2 py-0.5 rounded-md"
                        >
                          <img src={p.avatar} alt={p.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                          <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200">
                            {p.name} ({p.role})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  triggerHaptic('success');
                  const url = lastMatchedDriver.linkedin_handle
                    ? `https://linkedin.com/in/${lastMatchedDriver.linkedin_handle}`
                    : `https://linkedin.com/search/results/all/?keywords=${encodeURIComponent(lastMatchedDriver.name)}`;
                  window.open(url, '_blank');
                }}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#0A66C2]/15 text-[#0A66C2] flex items-center justify-center flex-shrink-0 active-spring"
                title="View LinkedIn Profile"
              >
                <span className="w-4 h-4 bg-[#0A66C2] text-white rounded-xs flex items-center justify-center text-[10px] font-black leading-none">
                  in
                </span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setShowChatModal(true);
                }}
                className="flex-1 h-10 px-4 btn-electric-mint text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 active-spring"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message Driver</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setLastMatchedDriver(null);
                }}
                className="h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs active-spring flex-shrink-0"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Icebreaker & Chat Sheet */}
      {showChatModal && lastMatchedDriver && (
        <IcebreakerChatModal
          isOpen={showChatModal}
          onClose={() => {
            setShowChatModal(false);
            setLastMatchedDriver(null);
          }}
          personName={lastMatchedDriver.name}
          personAvatar={lastMatchedDriver.avatar}
          tripPurpose={lastMatchedDriver.trip_purpose}
          conversationVibe={lastMatchedDriver.conversation_vibe}
          musicVibe={lastMatchedDriver.music_vibe}
          interests={lastMatchedDriver.interests}
          vehiclePlate={lastMatchedDriver.vehicle.plate_number}
        />
      )}
    </div>
  );
};
