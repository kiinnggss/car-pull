'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  MapPin,
  ShieldCheck,
  X,
  Check,
  ArrowUpDown,
  Clock,
  Zap,
  Sparkles,
} from 'lucide-react';
import { DeparturesSheet } from './DeparturesSheet';
import { triggerHaptic } from '@/lib/haptics';

export const RoutePlannerBar: React.FC = () => {
  const {
    riderRoute,
    lagosLocations,
    setRiderOrigin,
    setRiderDestination,
    swapRiderRoute,
    selectedSafeZone,
    safeZones,
    setSelectedSafeZone,
    drivers,
  } = useAppStore();

  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showHubModal, setShowHubModal] = useState(false);
  const [showDeparturesSheet, setShowDeparturesSheet] = useState(false);
  const [selectingType, setSelectingType] = useState<'origin' | 'destination'>('origin');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const anySubModalOpen = showRouteModal || showHubModal;
    if (!anySubModalOpen) return;

    window.history.pushState({ modal: 'route-planner' }, '');

    const handlePopState = () => {
      setShowRouteModal(false);
      setShowHubModal(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showRouteModal, showHubModal]);

  const closeModalsWithHistory = () => {
    if (window.history.state?.modal === 'route-planner') {
      window.history.back();
    } else {
      setShowRouteModal(false);
      setShowHubModal(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-[404px] mx-auto px-3 mb-1.5 flex-shrink-0">
        {/* Slim Single-Row Route Pill */}
        <div className="floating-surface rounded-full p-1 pl-3 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setSelectingType('origin');
              setShowRouteModal(true);
            }}
            className="flex-1 min-w-0 text-left flex items-center gap-2 active-press"
            title="Edit pickup and destination"
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            />
            <div className="min-w-0 flex-1 flex items-center gap-1.5 text-[11.5px] font-extrabold truncate">
              <span className="truncate">{riderRoute.origin.split('/')[0].trim()}</span>
              <span style={{ color: 'var(--text-secondary)' }}>→</span>
              <span className="truncate">{riderRoute.destination.split('(')[0].trim()}</span>
            </div>
          </button>

          {/* Right Pill Triggers: Schedule & Safe Hub */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => {
                triggerHaptic('tap');
                setShowDeparturesSheet(true);
              }}
              className="h-7 px-2.5 rounded-full text-[10.5px] font-mono font-extrabold flex items-center gap-1 active-press"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
              }}
              title="View Departure Schedule"
            >
              <Clock className="w-3 h-3" style={{ color: 'var(--accent-primary)' }} />
              <span>{drivers.length}</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('tap');
                setShowHubModal(true);
              }}
              className="h-7 px-2.5 rounded-full text-[10.5px] font-extrabold flex items-center gap-1 active-press"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--accent-primary-fg)',
              }}
              title="Select CCTV Safe Pickup Hub"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Hub</span>
            </button>
          </div>
        </div>
      </div>

      <DeparturesSheet
        isOpen={showDeparturesSheet}
        onClose={() => setShowDeparturesSheet(false)}
      />

      {/* Uber Green "Order Taxi" Style Route & Wishes Sheet Modal */}
      {showRouteModal &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[700] bg-black/70 backdrop-blur-xs overflow-y-auto p-3 flex items-end sm:items-center justify-center animate-in fade-in duration-150">
            <div className="w-full max-w-[400px] floating-surface rounded-[32px] p-5 space-y-4 my-auto animate-in slide-in-from-bottom duration-200">
              {/* Top Handle & Title (Uber Green Middle Screen) */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-black text-[#0B0C0E] dark:text-white">
                  Plan Commute
                </h3>
                <button
                  onClick={closeModalsWithHistory}
                  className="w-8 h-8 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] text-[#0B0C0E] dark:text-white flex items-center justify-center active-press"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Uber Green Vertical Dotted Pickup -> Dropoff Timeline */}
              <div className="p-3.5 rounded-[24px] bg-[#F4F5F7] dark:bg-[#1E2028] flex items-center justify-between gap-3">
                <div className="flex items-stretch gap-3 flex-1 min-w-0">
                  <div className="flex flex-col items-center justify-between py-2">
                    <MapPin className="w-4 h-4 text-[#0B0C0E] dark:text-[#C8FF00]" />
                    <div className="w-0.5 flex-1 my-1 border-l-2 border-dotted border-[#525866]" />
                    <MapPin className="w-4 h-4 text-[#FF9F0A]" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectingType('origin')}
                      className={`w-full text-left p-2 rounded-2xl transition-colors ${
                        selectingType === 'origin'
                          ? 'bg-white dark:bg-[#14161B] shadow-2xs'
                          : ''
                      }`}
                    >
                      <span className="text-[10px] font-bold text-[#525866] dark:text-[#9BA1AE] block">
                        Pickup Point
                      </span>
                      <span className="text-xs font-extrabold text-[#0B0C0E] dark:text-white truncate block">
                        {riderRoute.origin}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectingType('destination')}
                      className={`w-full text-left p-2 rounded-2xl transition-colors ${
                        selectingType === 'destination'
                          ? 'bg-white dark:bg-[#14161B] shadow-2xs'
                          : ''
                      }`}
                    >
                      <span className="text-[10px] font-bold text-[#525866] dark:text-[#9BA1AE] block">
                        Drop-off Point
                      </span>
                      <span className="text-xs font-extrabold text-[#0B0C0E] dark:text-white truncate block">
                        {riderRoute.destination}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    swapRiderRoute();
                  }}
                  className="w-9 h-9 rounded-full bg-white dark:bg-[#14161B] text-[#0B0C0E] dark:text-white flex items-center justify-center active-press flex-shrink-0"
                  title="Swap Origin & Destination"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              {/* Uber Green "Additional Wishes" 2-Column Square Bento Cards */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-[#0B0C0E] dark:text-white block">
                  Additional Wishes
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="volt-surface rounded-[24px] p-3.5 flex flex-col justify-between min-h-[104px]">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-extrabold block text-[#0B0C0E]">
                          Sec 44 Split
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#0B0C0E]/75">
                          -40% Fuel Cap
                        </span>
                      </div>
                      <Check className="w-4 h-4 text-[#0B0C0E] stroke-[2.5]" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#0B0C0E] text-[#C8FF00] flex items-center justify-center mt-2">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowRouteModal(false);
                      setShowHubModal(true);
                    }}
                    className="rounded-[24px] bg-[#F4F5F7] dark:bg-[#1E2028] p-3.5 flex flex-col justify-between min-h-[104px] text-left active-press"
                  >
                    <div>
                      <span className="text-xs font-extrabold block text-[#0B0C0E] dark:text-white">
                        CCTV Safe Hub
                      </span>
                      <span className="text-[10px] text-[#525866] dark:text-[#9BA1AE] line-clamp-1 mt-0.5">
                        {selectedSafeZone.name}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-[#14161B] text-[#0B0C0E] dark:text-white flex items-center justify-center mt-2">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Corridor Stops Selector */}
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1 no-scrollbar">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#525866] dark:text-[#9BA1AE] block">
                  Select {selectingType === 'origin' ? 'Pickup' : 'Drop-off'} Stop
                </span>
                {lagosLocations.map((loc) => {
                  const isCurrent =
                    selectingType === 'origin'
                      ? riderRoute.origin === loc.name
                      : riderRoute.destination === loc.name;

                  return (
                    <button
                      key={loc.id}
                      onClick={() => {
                        if (selectingType === 'origin') {
                          setRiderOrigin(loc.name, loc.coordinates);
                        } else {
                          setRiderDestination(loc.name, loc.coordinates);
                        }
                        closeModalsWithHistory();
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-[#0B0C0E] dark:bg-[#C8FF00] text-white dark:text-[#0B0C0E]'
                          : 'bg-[#F4F5F7] dark:bg-[#1E2028] text-[#0B0C0E] dark:text-white hover:opacity-90'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block">{loc.name}</span>
                        <span className="text-[10px] opacity-70">{loc.area}</span>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Safe Hub Selector Sheet */}
      {showHubModal &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[700] bg-black/70 backdrop-blur-xs overflow-y-auto p-3 flex items-end sm:items-center justify-center animate-in fade-in duration-150">
            <div className="w-full max-w-[400px] floating-surface rounded-[32px] p-5 space-y-3.5 my-auto animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-display font-black text-[#0B0C0E] dark:text-white">
                    CCTV Safe Pickup Hubs
                  </h3>
                  <span className="text-[11px] text-[#525866] dark:text-[#9BA1AE]">
                    Off-street guarded forecourts • 45s max dwell
                  </span>
                </div>
                <button
                  onClick={closeModalsWithHistory}
                  className="w-8 h-8 rounded-full bg-[#F4F5F7] dark:bg-[#1E2028] text-[#0B0C0E] dark:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
                {safeZones.map((zone) => {
                  const isSelected = selectedSafeZone.id === zone.id;
                  return (
                    <button
                      key={zone.id}
                      onClick={() => {
                        setSelectedSafeZone(zone);
                        closeModalsWithHistory();
                      }}
                      className={`w-full text-left p-3.5 rounded-[22px] transition-all flex items-center justify-between ${
                        isSelected
                          ? 'volt-surface'
                          : 'bg-[#F4F5F7] dark:bg-[#1E2028] text-[#0B0C0E] dark:text-white'
                      }`}
                    >
                      <div className="pr-2">
                        <span className="text-xs font-extrabold block">{zone.name}</span>
                        <span className="text-[10px] opacity-75 block mt-0.5">{zone.address}</span>
                      </div>
                      {isSelected && (
                        <div className="w-7 h-7 rounded-full bg-[#0B0C0E] text-[#C8FF00] flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
