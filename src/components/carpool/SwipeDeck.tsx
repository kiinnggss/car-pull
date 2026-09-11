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
        colors: ['#0D6E6E', '#C25E2E', '#7C3AED', '#D97706'],
      });
    });

    swipeRight();
  };

  const hasCardsLeft = currentDriver !== null && activeDriverIndex < drivers.length;

  return (
    <div className="flex-1 flex flex-col justify-between w-full max-w-[400px] mx-auto px-3 h-full min-h-0">
      {/* Top: Transit Console */}
      <div className="w-full pt-0.5 flex-shrink-0 space-y-1.5">
        <RoutePlannerBar />

        {/* Discovery View Switcher: Swipe Cards vs Street Map */}
        <div className="w-full flex bg-[#ECE5D8] dark:bg-stone-900 p-0.5 rounded-2xl border border-[#DDD4C5] dark:border-stone-800">
          <button
            onClick={() => setActiveTab('deck')}
            className="flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all bg-white dark:bg-[#1E1B18] text-[#0D6E6E] dark:text-[#14B8A6] shadow-xs flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Swipe Cards</span>
          </button>
          <button
            onClick={() => {
              triggerHaptic('switch');
              setActiveTab('map');
            }}
            className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-[#70665A] dark:text-stone-400 hover:text-[#141210] dark:hover:text-stone-200 flex items-center justify-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Street Map</span>
          </button>
        </div>
      </div>

      {/* Center: Expansive Swipeable Profile Card Deck */}
      <div className="relative w-full flex-1 min-h-[320px] max-h-[480px] my-2 flex items-center justify-center">
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
            <div className="w-full h-full min-h-[320px] rounded-2xl bg-white border border-[#DDD4C5] flex flex-col items-center justify-center p-5 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0D6E6E]">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-serif font-black text-[#141210]">All Commuters Reviewed</h3>
                <p className="text-[11px] text-[#70665A] max-w-[240px] mx-auto">
                  No more active drivers on this corridor for the selected trip mode.
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

      {/* Bottom: Flowing Split Stepper & Primary Thumb Action Console */}
      {hasCardsLeft && (
        <div className="w-full flex-shrink-0 pb-1">
          <QuickBidPills onAccept={triggerAccept} onPass={swipeLeft} />
        </div>
      )}

      {/* Match Confirmation Modal with Back Button */}
      {lastMatchedDriver && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-[350px] bg-[#FAF8F3] rounded-2xl p-4 text-center space-y-3 shadow-2xl border border-[#DDD5C7]">
            <div className="flex items-center justify-between border-b border-[#DDD5C7] pb-2">
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setLastMatchedDriver(null);
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-[#DDD5C7] text-xs font-bold text-[#141210] shadow-2xs active:scale-95"
              >
                <ArrowLeft className="w-3 h-3 text-[#C25E2E]" />
                <span>Back</span>
              </button>
              <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Connected &amp; Escrow Held
              </span>
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setLastMatchedDriver(null);
                }}
                className="p-1 rounded-lg text-stone-500 hover:text-stone-900 active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="w-14 h-14 mx-auto rounded-2xl overflow-hidden border-2 border-[#0D6E6E] shadow-sm">
                <img
                  src={lastMatchedDriver.avatar}
                  alt={lastMatchedDriver.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-base font-serif font-black text-[#141210]">
                Connected with {lastMatchedDriver.name}!
              </h3>

              {/* Mutual Spark */}
              {lastMatchedDriver.mutual_spark && (
                <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#B45309] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{lastMatchedDriver.mutual_spark}</span>
                </div>
              )}

              {lastMatchedDriver.trip_purpose && (
                <div className="bg-[#EEF7F7] border border-[#0D6E6E]/25 rounded-xl px-2.5 py-1 text-[11px] text-[#0D6E6E] font-semibold flex items-center justify-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#C25E2E] flex-shrink-0" />
                  <span className="truncate">{lastMatchedDriver.trip_purpose}</span>
                </div>
              )}

              {/* Cabin Co-Riders Preview in Modal */}
              {lastMatchedDriver.cabin_passengers && lastMatchedDriver.cabin_passengers.length > 0 && (
                <div className="bg-white border border-[#DDD4C5] p-2 rounded-xl text-left space-y-1">
                  <span className="text-[9px] font-extrabold text-[#70665A] uppercase tracking-wider block">
                    Cabin Mates on This Trip:
                  </span>
                  <div className="flex items-center gap-2">
                    {lastMatchedDriver.cabin_passengers.map((p: any) => (
                      <div key={p.id} className="flex items-center gap-1 bg-[#F8F5EE] border border-[#DDD4C5] px-2 py-0.5 rounded-lg">
                        <img src={p.avatar} alt={p.name} className="w-4 h-4 rounded-full object-cover" />
                        <span className="text-[10px] font-bold text-[#141210]">{p.name} ({p.role})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

            {/* Social Connection CTA: Say Hello & Break the Ice */}
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setShowChatModal(true);
                }}
                className="w-full py-2.5 px-3 bg-[#0D6E6E] hover:bg-[#094E4E] text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-amber-300" />
                <span>Say Hello / Break the Ice</span>
              </button>

              {/* Digital Handshake / LinkedIn Exchange */}
              <button
                onClick={() => {
                  triggerHaptic('success');
                  const url = lastMatchedDriver.linkedin_handle
                    ? `https://linkedin.com/in/${lastMatchedDriver.linkedin_handle}`
                    : `https://linkedin.com/search/results/all/?keywords=${encodeURIComponent(lastMatchedDriver.name)}`;
                  window.open(url, '_blank');
                }}
                className="w-full py-2 px-3 bg-white hover:bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/30 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs active-press transition-all"
              >
                <span className="w-3.5 h-3.5 bg-[#0A66C2] text-white rounded-xs flex items-center justify-center text-[9px] font-black leading-none">
                  in
                </span>
                <span>Stay in Touch on LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-[#0A66C2]" />
              </button>

              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setLastMatchedDriver(null);
                }}
                className="w-full py-1.5 bg-[#ECE5D8] hover:bg-[#DDD4C5] text-[#141210] font-bold text-xs rounded-xl transition-colors"
              >
                Keep Browsing
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
