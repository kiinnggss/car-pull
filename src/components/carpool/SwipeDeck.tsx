'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store/useAppStore';
import { ProfileCard } from './ProfileCard';
import { QuickBidPills } from './QuickBidPills';
import { RoutePlannerBar } from './RoutePlannerBar';
import { RotateCcw, CheckCircle2, Sparkles, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatNgn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

export const SwipeDeck: React.FC = () => {
  const {
    currentDriver,
    drivers,
    activeDriverIndex,
    swipeLeft,
    swipeRight,
    resetDeck,
    customBidNgn,
    selectedSafeZone,
    setActiveTab,
  } = useAppStore();

  const [exitX, setExitX] = useState<number>(0);
  const [matchSuccessModal, setMatchSuccessModal] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const opacity = useTransform(x, [-250, -150, 0, 150, 250], [0, 1, 1, 1, 0]);

  const likeOpacity = useTransform(x, [25, 110], [0, 1]);
  const nopeOpacity = useTransform(x, [-25, -110], [0, 1]);

  const triggerMatchConfetti = () => {
    confetti({
      particleCount: 55,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#C8FF00', '#0B0C0E', '#FF9F0A'],
    });
  };

  const handleDragEnd = (_event: any, info: any) => {
    const threshold = 95;
    if (info.offset.x > threshold) {
      setExitX(280);
      triggerHaptic('match');
      triggerMatchConfetti();
      setMatchSuccessModal(true);
      setTimeout(() => {
        swipeRight();
        setExitX(0);
        x.set(0);
      }, 220);
    } else if (info.offset.x < -threshold) {
      setExitX(-280);
      triggerHaptic('tap');
      setTimeout(() => {
        swipeLeft();
        setExitX(0);
        x.set(0);
      }, 200);
    }
  };

  const handleManualAccept = () => {
    setExitX(280);
    triggerHaptic('match');
    triggerMatchConfetti();
    setMatchSuccessModal(true);
    setTimeout(() => {
      swipeRight();
      setExitX(0);
      x.set(0);
    }, 220);
  };

  const handleManualReject = () => {
    setExitX(-280);
    triggerHaptic('tap');
    setTimeout(() => {
      swipeLeft();
      setExitX(0);
      x.set(0);
    }, 200);
  };

  if (!currentDriver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#C8FF00] text-[#0B0C0E] flex items-center justify-center shadow-lg">
          <Sparkles className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-display font-black text-[#0B0C0E] dark:text-white">
            All Corridor Peers Reviewed
          </h3>
          <p className="text-xs text-[#525866] dark:text-[#9BA1AE] max-w-xs">
            You have swiped through every verified driver for this departure window. Reload the deck or explore the live street map.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={resetDeck}
            className="px-5 py-3 btn-electric-mint text-xs font-extrabold rounded-full flex items-center gap-2 active-press"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Deck</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className="px-5 py-3 rounded-full bg-white dark:bg-[#14161B] border border-black/10 dark:border-white/10 text-xs font-extrabold text-[#0B0C0E] dark:text-white flex items-center gap-2 active-press"
          >
            <Compass className="w-4 h-4" />
            <span>Open Map</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[404px] mx-auto flex flex-col items-center justify-between h-full select-none">
      {/* Compact Route & Wishes Trigger Bar */}
      <RoutePlannerBar />

      {/* Swipeable Full-Bleed Card Stack */}
      <div className="relative w-full px-3 flex-1 flex flex-col justify-center">
        {/* Next Card Peek Stack */}
        {activeDriverIndex + 1 < drivers.length && (
          <div className="absolute inset-x-6 top-3 bottom-2 rounded-[32px] bg-[#0B0C0E]/40 dark:bg-white/5 scale-[0.95] translate-y-2 pointer-events-none" />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentDriver.id}
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            animate={{ x: exitX }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="w-full cursor-grab active:cursor-grabbing relative z-10"
          >
            {/* Swipe Right Stamp */}
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-12 left-5 z-30 bg-[#C8FF00] text-[#0B0C0E] font-mono font-black text-xs px-3.5 py-1.5 rounded-full -rotate-12 pointer-events-none uppercase tracking-wider shadow-lg"
            >
              CONNECT • {formatNgn(customBidNgn)}
            </motion.div>

            {/* Swipe Left Stamp */}
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-12 right-5 z-30 bg-red-600 text-white font-mono font-black text-xs px-3.5 py-1.5 rounded-full rotate-12 pointer-events-none uppercase tracking-wider shadow-lg"
            >
              PASS
            </motion.div>

            <ProfileCard driver={currentDriver} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Action Dock */}
      <div className="w-full px-3">
        <QuickBidPills onReject={handleManualReject} onAccept={handleManualAccept} />
      </div>

      {/* Match Reserved Modal */}
      {matchSuccessModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setMatchSuccessModal(false)}
        >
          <div
            className="volt-surface rounded-[32px] p-6 max-w-xs w-full text-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-[#0B0C0E] text-[#C8FF00] flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-xl font-display font-black text-[#0B0C0E]">
              Seat Reserved!
            </h4>
            <p className="text-xs font-medium text-[#0B0C0E]/80 leading-relaxed">
              <strong className="font-mono font-black">{formatNgn(customBidNgn)}</strong> is locked in Zero-Cash Escrow. Meet at{' '}
              <strong>{selectedSafeZone.name}</strong>.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setMatchSuccessModal(false)}
                className="py-3 bg-white/80 hover:bg-white text-[#0B0C0E] font-extrabold text-xs rounded-full transition-colors"
              >
                Keep Swiping
              </button>
              <button
                onClick={() => {
                  setMatchSuccessModal(false);
                  setActiveTab('matches');
                }}
                className="py-3 bg-[#0B0C0E] text-[#C8FF00] font-extrabold text-xs rounded-full transition-colors"
              >
                View Ride
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
