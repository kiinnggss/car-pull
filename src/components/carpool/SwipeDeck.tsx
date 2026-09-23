'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { useAppStore } from '@/lib/store/useAppStore';
import { ProfileCard } from './ProfileCard';
import { QuickBidPills } from './QuickBidPills';
import { RoutePlannerBar } from './RoutePlannerBar';
import { RefreshCw, CheckCircle, Sparkles, Calendar, ArrowLeft, X, MessageCircle, Compass, Share2, Users, ExternalLink, Navigation } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatNgn } from '@/lib/utils';
import { IcebreakerChatModal } from './IcebreakerChatModal';
import { triggerHaptic } from '@/lib/haptics';

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

  const [lastMatchedDriver, setLastMatchedDriver] = useState<any | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.6, 1, 1, 1, 0.6]);

  const acceptStampOpacity = useTransform(x, [40, 110], [0, 1]);
  const passStampOpacity = useTransform(x, [-40, -110], [0, 1]);

  // Physical sensory notch: trigger haptic tick when crossing decision threshold
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

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
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
        colors: ['#0F766E', '#F58A25', '#14B8A6', '#D97706'],
      });
    });

    swipeRight();
  };

  const hasCardsLeft = currentDriver !== null && activeDriverIndex < drivers.length;

  return (
    <div className="flex-1 flex flex-col justify-between w-full max-w-[400px] mx-auto px-3 h-full min-h-0 overflow-hidden py-1">
      {/* Top: Transit Console */}
      <div className="w-full flex-shrink-0 pb-1">
        <RoutePlannerBar />
      </div>

      {/* Center: Expansive Swipeable Profile Card Deck */}
      <div className="relative w-full flex-1 min-h-0 my-1 flex items-center justify-center overflow-hidden">
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
                className="absolute top-5 left-5 z-30 pointer-events-none transform -rotate-12 text-[#0D6E6E] dark:text-[#14B8A6] font-black text-sm px-3 py-1 rounded-xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-[0_8px_25px_rgba(13,110,110,0.35)] tracking-wider uppercase"
              >
                ACCEPT RIDE
              </motion.div>

              {/* Dynamic Overlay Stamp: PASS (Red) */}
              <motion.div
                style={{ opacity: passStampOpacity }}
                className="absolute top-5 right-5 z-30 pointer-events-none transform rotate-12 text-red-600 dark:text-red-400 font-black text-sm px-3 py-1 rounded-xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md shadow-[0_8px_25px_rgba(220,38,38,0.35)] tracking-wider uppercase"
              >
                PASS
              </motion.div>

              <ProfileCard driver={currentDriver} safeZone={selectedSafeZone} />
            </motion.div>
          ) : (
            /* Empty State Deck */
            <div className="w-full h-full min-h-[280px] rounded-3xl floating-surface flex flex-col items-center justify-center p-6 text-center space-y-3 shadow-specular">
              <div className="w-12 h-12 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">All Commuters Reviewed</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto">
                  No more active drivers on this corridor for the selected trip mode.
                </p>
              </div>
              <button
                onClick={resetDeck}
                className="flex items-center gap-1.5 btn-electric-mint font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-specular active-spring"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Deck</span>
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom: Flowing Split Stepper & Primary Thumb Action Console */}
      {hasCardsLeft && (
        <div className="w-full flex-shrink-0 pt-0.5 pb-0.5">
          <QuickBidPills onAccept={triggerAccept} onPass={swipeLeft} />
        </div>
      )}

      {/* Match Confirmation Modal with Back Button */}
      {lastMatchedDriver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[350px] floating-surface rounded-3xl p-5 text-center space-y-3.5 shadow-specular">
            <div className="flex items-center justify-between pb-2">
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setLastMatchedDriver(null);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl floating-pill bg-slate-100/90 dark:bg-slate-800/90 text-xs font-bold text-slate-900 dark:text-slate-100 shadow-xs active-spring"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
                <span>Back</span>
              </button>
              <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider bg-emerald-500/15 px-2.5 py-1 rounded-full shadow-xs">
                Connected &amp; Escrow Held
              </span>
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setLastMatchedDriver(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 active-spring"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="w-14 h-14 mx-auto rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={lastMatchedDriver.avatar}
                  alt={lastMatchedDriver.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Connected with {lastMatchedDriver.name}!
              </h3>

              {/* Mutual Spark */}
              {lastMatchedDriver.mutual_spark && (
                <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full shadow-xs">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{lastMatchedDriver.mutual_spark}</span>
                </div>
              )}

              {lastMatchedDriver.trip_purpose && (
                <div className="bg-teal-500/10 rounded-xl px-2.5 py-1 text-[11px] text-teal-700 dark:text-teal-300 font-semibold flex items-center justify-center gap-1.5 shadow-xs">
                  <Compass className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="truncate">{lastMatchedDriver.trip_purpose}</span>
                </div>
              )}

              {/* Cabin Co-Riders Preview in Modal */}
              {lastMatchedDriver.cabin_passengers && lastMatchedDriver.cabin_passengers.length > 0 && (
                <div className="bg-slate-100/80 dark:bg-slate-900/60 p-2.5 rounded-2xl text-left space-y-1 shadow-xs">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Cabin Mates on This Trip:
                  </span>
                  <div className="flex items-center gap-2">
                    {lastMatchedDriver.cabin_passengers.map((p: any) => (
                      <div key={p.id} className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg shadow-xs">
                        <img src={p.avatar} alt={p.name} className="w-4 h-4 rounded-full object-cover" />
                        <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">{p.name} ({p.role})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 py-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {lastMatchedDriver.vehicle.make} {lastMatchedDriver.vehicle.model}
                </span>
                <span className="font-mono tabular-nums text-[10px] font-black text-teal-700 dark:text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded-md shadow-xs">
                  {lastMatchedDriver.vehicle.plate_number}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Escrow hold of <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{formatNgn(customBidNgn)}</strong> secured.
              </p>
            </div>

            {/* Grouped Match Actions: LinkedIn icon, Chat CTA, and Done dismiss */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  triggerHaptic('success');
                  const url = lastMatchedDriver.linkedin_handle
                    ? `https://linkedin.com/in/${lastMatchedDriver.linkedin_handle}`
                    : `https://linkedin.com/search/results/all/?keywords=${encodeURIComponent(lastMatchedDriver.name)}`;
                  window.open(url, '_blank');
                }}
                className="w-11 h-10 rounded-2xl bg-white dark:bg-slate-800 hover:bg-[#0A66C2]/15 text-[#0A66C2] shadow-xs active-spring flex items-center justify-center flex-shrink-0"
                title="LinkedIn Profile"
              >
                <span className="w-5 h-5 bg-[#0A66C2] text-white rounded flex items-center justify-center text-[10px] font-black leading-none">
                  in
                </span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setShowChatModal(true);
                }}
                className="flex-1 h-10 px-4 btn-electric-mint text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 shadow-specular active-spring transition-all"
              >
                <MessageCircle className="w-4 h-4 text-slate-950" />
                <span>Chat</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setLastMatchedDriver(null);
                }}
                className="h-10 px-4 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs active-spring transition-colors flex-shrink-0"
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
