'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { StreetCarpoolRide, NeighborhoodRider } from '@/lib/types';
import {
  MapPin,
  Car,
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
  MessageCircle,
  Sparkles,
  Search,
  Crosshair,
} from 'lucide-react';
import { formatNgn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';
import {
  interpolateAlongPolyline,
  estimateEtaMinutes,
  formatEtaLabel,
  parseBaseEtaMinutes,
} from '@/lib/liveTracking';
import type * as Leaflet from 'leaflet';

interface CorridorMapProps {
  isBackgroundUnderlay?: boolean;
}

export const CorridorMap: React.FC<CorridorMapProps> = ({ isBackgroundUnderlay = false }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Leaflet.Map | null>(null);
  const markersRef = useRef<{ [key: string]: Leaflet.Layer }>({});
  const driverMarkersRef = useRef<{ [key: string]: Leaflet.Marker }>({});
  const polylinesRef = useRef<Leaflet.Layer[]>([]);
  const rideProgressRef = useRef<Record<string, number>>({});

  const {
    userStreet,
    setUserStreet,
    setUserStreetByNameOrCoords,
    selectedDestination,
    setSelectedDestination,
    selectedDayFilter,
    setSelectedDayFilter,
    everydayRides,
    streetLocations,
    neighborhoodRiders,
    bookEverydayRide,
    setActiveTab,
    setActiveThreadId,
    getOrCreateThreadForDriver,
    showFeedbackBanner,
  } = useAppStore();

  const [selectedRide, setSelectedRide] = useState<StreetCarpoolRide | null>(null);
  const [selectedRider, setSelectedRider] = useState<NeighborhoodRider | null>(null);
  const [showStreetPicker, setShowStreetPicker] = useState(false);
  const [showDestPicker, setShowDestPicker] = useState(false);
  const [searchStreetText, setSearchStreetText] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [bookedSuccessRide, setBookedSuccessRide] = useState<StreetCarpoolRide | null>(null);
  const [rideProgress, setRideProgress] = useState<Record<string, number>>({});

  const filteredRides = useMemo(() => {
    return everydayRides.filter((ride) => {
      if (selectedDestination !== 'all') {
        const matchesDest =
          ride.destination.toLowerCase().includes(selectedDestination.toLowerCase()) ||
          selectedDestination.toLowerCase().includes(ride.destination.toLowerCase());
        if (!matchesDest) return false;
      }

      if (selectedDayFilter === 'now') {
        return ride.departureCategory === 'leaving_now';
      }
      if (selectedDayFilter === 'today') {
        return ride.departureCategory === 'today' || ride.departureCategory === 'leaving_now';
      }
      if (selectedDayFilter === 'tomorrow') {
        return ride.departureCategory === 'tomorrow';
      }
      if (selectedDayFilter === 'weekend') {
        return ride.departureCategory === 'weekend';
      }

      return true;
    });
  }, [everydayRides, selectedDestination, selectedDayFilter]);

  useEffect(() => {
    if (!selectedRide && filteredRides.length > 0) {
      const nearest = filteredRides.find((r) => r.passesNearUser) || filteredRides[0];
      setSelectedRide(nearest);
    }
  }, [filteredRides, selectedRide]);

  // Step driver markers smoothly along their corridor polylines with a live ticking ETA
  useEffect(() => {
    if (filteredRides.length === 0) return;

    const interval = setInterval(() => {
      const next: Record<string, number> = { ...rideProgressRef.current };
      filteredRides.forEach((ride, idx) => {
        const fallback = 0.08 + ((idx * 0.17) % 0.45);
        const current = typeof next[ride.id] === 'number' ? next[ride.id] : fallback;
        const stepped = current + 0.035;
        const wrapped = stepped >= 0.96 ? 0.05 : stepped;
        next[ride.id] = wrapped;

        const marker = driverMarkersRef.current[ride.id];
        if (marker && ride.routePath.length > 1) {
          const [lat, lng] = interpolateAlongPolyline(ride.routePath, wrapped);
          marker.setLatLng([lat, lng]);
        }
      });

      rideProgressRef.current = next;
      setRideProgress({ ...next });
    }, 1500);

    return () => clearInterval(interval);
  }, [filteredRides]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 150);
    }
  }, [isBackgroundUnderlay]);

  useEffect(() => {
    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const initialCenter: [number, number] = [userStreet.coordinates.lat, userStreet.coordinates.lng];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 13,
        minZoom: 10,
        maxZoom: 18,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      map.on('click', (e: Leaflet.LeafletMouseEvent) => {
        triggerHaptic('tap');
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        let closest = streetLocations[0];
        let minD = Infinity;
        streetLocations.forEach((st) => {
          const d = Math.hypot(st.coordinates.lat - lat, st.coordinates.lng - lng);
          if (d < minD) {
            minD = d;
            closest = st;
          }
        });

        const streetName = minD < 0.015 ? closest.name : `Street near ${closest.area}`;
        setUserStreetByNameOrCoords(streetName, { lat, lng }, closest.area);
      });

      mapInstanceRef.current = map;
      renderMapElements(L, map);
    }

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    async function updateLayers() {
      if (!mapInstanceRef.current) return;
      const L = (await import('leaflet')).default;
      renderMapElements(L, mapInstanceRef.current);
    }
    updateLayers();
  }, [userStreet, filteredRides, selectedRide]);

  const renderMapElements = (L: typeof Leaflet, map: Leaflet.Map) => {
    polylinesRef.current.forEach((p) => p.remove());
    polylinesRef.current = [];

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};
    driverMarkersRef.current = {};

    const userCoords: [number, number] = [userStreet.coordinates.lat, userStreet.coordinates.lng];

    const userWalkingCircle = L.circle(userCoords, {
      radius: 400,
      color: '#0B0C0E',
      fillColor: '#3B82F6',
      fillOpacity: 0.22,
      weight: 2,
      dashArray: '4, 4',
    }).addTo(map);
    polylinesRef.current.push(userWalkingCircle);

    const userPinHtml = `
      <div class="relative flex flex-col items-center">
        <span class="absolute -inset-2 rounded-full bg-[var(--accent-primary)]/60 animate-ping"></span>
        <div class="w-8 h-8 rounded-full bg-[var(--bg-sheet)] text-[var(--text-primary)] flex items-center justify-center shadow-lg ring-2 ring-[var(--accent-primary)] z-20">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <span class="mt-1 bg-[var(--bg-sheet)] text-[var(--text-primary)] px-2 py-0.5 rounded-full text-[9px] font-mono font-black shadow-md whitespace-nowrap z-20">
          YOUR STREET
        </span>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userPinHtml,
      className: 'custom-user-pin',
      iconSize: [36, 48],
      iconAnchor: [18, 24],
    });

    const userMarker = L.marker(userCoords, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
    markersRef.current['user-pin'] = userMarker;

    filteredRides.forEach((ride) => {
      const isSelected = selectedRide?.id === ride.id;
      const isPasses = ride.passesNearUser;

      const routeColor = isSelected ? '#0B0C0E' : isPasses ? '#65A30D' : '#9BA1AE';
      const routeWeight = isSelected ? 6 : isPasses ? 4.5 : 3;
      const routeOpacity = isSelected ? 0.95 : isPasses ? 0.8 : 0.45;

      const polyline = L.polyline(ride.routePath, {
        color: routeColor,
        weight: routeWeight,
        opacity: routeOpacity,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      polyline.on('click', () => {
        triggerHaptic('tap');
        setSelectedRide(ride);
        setSelectedRider(null);
      });
      polylinesRef.current.push(polyline);

      const progress = rideProgressRef.current[ride.id] ?? 0.12;
      const driverCoords = interpolateAlongPolyline(ride.routePath, progress);
      const vehicleHtml = `
        <div class="relative flex flex-col items-center cursor-pointer transform hover:scale-110 transition-transform">
          ${isSelected ? '<span class="absolute -inset-2 rounded-full bg-[var(--accent-primary)]/60 animate-ping"></span>' : ''}
          <div class="relative w-8 h-8 rounded-full ${isSelected ? 'ring-2 ring-[var(--accent-primary)]' : ''} bg-[#0B0C0E] shadow-md overflow-hidden">
            <img src="${ride.driverAvatar}" class="w-full h-full object-cover" alt="${ride.driverName}" />
          </div>
          <span class="mt-0.5 bg-[#0B0C0E] text-white px-2 py-0.5 rounded-full text-[8px] font-mono font-black shadow-xs whitespace-nowrap">
            ${ride.driverName.split(' ')[0]} • ${ride.availableSeats} SEAT${ride.availableSeats === 1 ? '' : 'S'}
          </span>
        </div>
      `;

      const driverIcon = L.divIcon({
        html: vehicleHtml,
        className: 'custom-driver-pin',
        iconSize: [36, 44],
        iconAnchor: [18, 22],
      });

      const driverMarker = L.marker(driverCoords, { icon: driverIcon }).addTo(map);
      driverMarker.on('click', () => {
        triggerHaptic('tap');
        setSelectedRide(ride);
        setSelectedRider(null);
      });
      markersRef.current[`driver-${ride.id}`] = driverMarker;
      driverMarkersRef.current[ride.id] = driverMarker;
    });

    neighborhoodRiders.forEach((rider) => {
      const riderHtml = `
        <div class="relative flex flex-col items-center cursor-pointer transform hover:scale-110 transition-transform">
          <div class="w-6 h-6 rounded-full bg-[#0B0C0E] overflow-hidden shadow-sm">
            <img src="${rider.avatar}" class="w-full h-full object-cover" alt="${rider.name}" />
          </div>
          <span class="bg-[#FF9F0A] text-[#0B0C0E] px-1.5 rounded-full text-[7px] font-mono font-black shadow-xs whitespace-nowrap">
            ${rider.name.split(' ')[0].toUpperCase()}
          </span>
        </div>
      `;

      const riderIcon = L.divIcon({
        html: riderHtml,
        className: 'custom-rider-pin',
        iconSize: [28, 36],
        iconAnchor: [14, 18],
      });

      const riderMarker = L.marker([rider.coordinates.lat, rider.coordinates.lng], { icon: riderIcon }).addTo(map);
      riderMarker.on('click', () => {
        triggerHaptic('tap');
        setSelectedRider(rider);
      });
      markersRef.current[`rider-${rider.id}`] = riderMarker;
    });
  };

  const handleLocateMe = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      setIsLocating(true);
      triggerHaptic('tap');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserStreetByNameOrCoords('Your Current GPS Location', coords, 'Current Area');
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([coords.lat, coords.lng], 14, { duration: 1.2 });
          }
        },
        () => {
          setIsLocating(false);
          setUserStreetByNameOrCoords('Admiralty Way, Lekki Phase 1', { lat: 6.4480, lng: 3.4720 }, 'Lekki Phase 1');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  const handleBookRide = (ride: StreetCarpoolRide) => {
    triggerHaptic('match');
    const threadId = bookEverydayRide(ride.id);
    setBookedSuccessRide(ride);

    showFeedbackBanner(
      'Seat Reserved',
      `${ride.driverName} · ${formatNgn(ride.fuelSplitNgn)} held`,
      ride.vehicle.plateNumber
    );

    setTimeout(() => {
      if (threadId) {
        setActiveThreadId(threadId);
        setActiveTab('chats');
      } else {
        setActiveTab('matches');
      }
    }, 1200);
  };

  const filteredLocations = streetLocations.filter(
    (st) =>
      st.name.toLowerCase().includes(searchStreetText.toLowerCase()) ||
      st.area.toLowerCase().includes(searchStreetText.toLowerCase())
  );

  return (
    <div className="relative w-full h-full flex flex-col bg-transparent overflow-hidden">
      {/* Top Floating Command Strip */}
      {!isBackgroundUnderlay && (
        <div className="absolute top-3 left-3 right-3 z-[500] max-w-[404px] mx-auto space-y-2 animate-in fade-in duration-200">
          <div className="floating-surface rounded-xl p-1.5 pl-3 flex items-center gap-1">
            <button
              onClick={() => {
                triggerHaptic('tap');
                setShowStreetPicker(true);
              }}
              className="flex-1 flex items-center gap-2 py-1 text-left active-press min-w-0"
              title="Change pickup street"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-mono uppercase font-semibold text-[var(--text-secondary)] block leading-none">
                  Pickup
                </span>
                <span className="text-xs font-semibold text-[var(--text-primary)] truncate block mt-0.5">
                  {userStreet.name.split(',')[0]}
                </span>
              </div>
            </button>

            <ArrowRight className="w-3.5 h-3.5 text-[var(--text-secondary)] flex-shrink-0 mx-1" />

            <button
              onClick={() => {
                triggerHaptic('tap');
                setShowDestPicker(true);
              }}
              className="flex-1 flex items-center gap-2 py-1 text-left active-press min-w-0"
              title="Filter destination"
            >
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-mono uppercase font-semibold text-[var(--text-secondary)] block leading-none">
                  Drop-off
                </span>
                <span className="text-xs font-semibold text-[var(--text-primary)] truncate block mt-0.5">
                  {selectedDestination === 'all' ? 'Any Corridor' : selectedDestination}
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                triggerHaptic('switch');
                setActiveTab('deck');
              }}
              className="w-9 h-9 rounded-lg bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] flex items-center justify-center active-press flex-shrink-0"
              title="Switch to Discover Deck"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {/* Day Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'all', label: 'All Days' },
                { id: 'now', label: 'Leaving Now' },
                { id: 'today', label: 'Today' },
                { id: 'tomorrow', label: 'Tomorrow' },
                { id: 'weekend', label: 'Weekend' },
              ] as const
            ).map((chip) => (
              <button
                key={chip.id}
                onClick={() => {
                  triggerHaptic('tap');
                  setSelectedDayFilter(chip.id);
                }}
                className={`h-7 px-3 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors active-press ${
                  selectedDayFilter === chip.id
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-fg)]'
                    : 'floating-pill text-[var(--text-primary)]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full-Bleed Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating GPS Button */}
      {!isBackgroundUnderlay && (
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="absolute top-28 right-3.5 z-30 w-10 h-10 rounded-full bg-[var(--bg-sheet)] text-[var(--text-primary)] flex items-center justify-center active-press shadow-lg"
          title="Pin current GPS street"
        >
          <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
        </button>
      )}

      {/* Bottom Order Sheet Card */}
      {!isBackgroundUnderlay && selectedRide && !bookedSuccessRide && (
        <div className="absolute bottom-3 left-3 right-3 z-30 max-w-[404px] mx-auto animate-in slide-in-from-bottom duration-200">
          <div className="floating-surface rounded-2xl p-3.5 space-y-2.5 text-[var(--text-primary)]">
            {/* Driver Identity & Rating */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-11 h-11 rounded-full bg-[var(--bg-sheet)] text-[var(--text-primary)] flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 overflow-hidden">
                  <span>{selectedRide.driverName.split(' ').map((n) => n[0]).join('')}</span>
                  <img
                    src={selectedRide.driverAvatar}
                    alt={selectedRide.driverName}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-display font-black truncate">
                      {selectedRide.driverName}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] text-[10px] font-mono font-black flex-shrink-0">
                      ★ {selectedRide.driverRating}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--text-secondary)] font-medium truncate block">
                    {selectedRide.driverRole}
                  </span>
                </div>
              </div>

              <span className="plate-badge flex-shrink-0">
                {selectedRide.vehicle.plateNumber}
              </span>
            </div>

            {/* Uber Green Connected Dotted Pickup -> Dropoff Timeline */}
            <div className="p-3 rounded-[22px] bg-[var(--bg-subtle)] flex items-stretch gap-3 text-xs">
              <div className="flex flex-col items-center justify-between py-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0B0C0E] dark:bg-[var(--accent-primary)]" />
                <div className="w-0.5 flex-1 my-1 border-l-2 border-dotted border-[#525866]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF9F0A]" />
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-[var(--text-primary)] truncate">
                    {selectedRide.pickupStreetCorner}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] flex-shrink-0">
                    ~{selectedRide.pickupWalkMinutes}m walk
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[var(--text-secondary)] truncate">
                    {selectedRide.destination}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#FF9F0A] flex-shrink-0 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <Clock className="w-3 h-3" />
                    {formatEtaLabel(
                      estimateEtaMinutes(
                        parseBaseEtaMinutes(
                          selectedRide.departureTime,
                          Math.max(5, selectedRide.pickupWalkMinutes + 5)
                        ),
                        rideProgress[selectedRide.id] ?? 0.12
                      )
                    )}
                  </span>
                </div>

                {/* Live Corridor Movement Bar */}
                <div className="pt-1 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-sheet)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-1000 ease-linear"
                      style={{ width: `${Math.round((rideProgress[selectedRide.id] ?? 0.12) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-[var(--text-secondary)] tabular-nums">
                    LIVE {Math.round((rideProgress[selectedRide.id] ?? 0.12) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Price & Reserve Bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[var(--bg-subtle)] rounded-xl p-1.5 pl-3 flex items-center justify-between">
                <div>
                  <span className="text-base font-bold font-mono tabular-nums text-[var(--text-primary)] block leading-none">
                    {formatNgn(selectedRide.fuelSplitNgn)}
                  </span>
                  <span className="text-[10px] font-medium text-[var(--text-secondary)]">
                    {selectedRide.availableSeats} seats open
                  </span>
                </div>

                <button
                  onClick={() => handleBookRide(selectedRide)}
                  className="h-9 px-4 btn-electric-mint text-xs active-press"
                >
                  Reserve seat
                </button>
              </div>

              <button
                onClick={() => {
                  triggerHaptic('tap');
                  const threadId = getOrCreateThreadForDriver({
                    id: selectedRide.driverId,
                    name: selectedRide.driverName,
                    avatar: selectedRide.driverAvatar,
                    plateNumber: selectedRide.vehicle.plateNumber,
                    safeZoneName: selectedRide.pickupStreetCorner,
                    employer: selectedRide.driverRole,
                  });
                  setActiveThreadId(threadId);
                  setActiveTab('chats');
                }}
                className="w-11 h-11 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] flex items-center justify-center active-press flex-shrink-0"
                title="Chat with Driver"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Success Toast */}
      {!isBackgroundUnderlay && bookedSuccessRide && (
        <div className="absolute bottom-[4.75rem] left-3 right-3 z-30 max-w-[400px] mx-auto volt-surface rounded-[28px] p-4 flex items-center justify-between animate-in zoom-in-95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-sheet)] text-[var(--text-primary)] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-display font-black">Seat Reserved!</h4>
              <p className="text-[11px] font-semibold opacity-75">
                Opening chat with {bookedSuccessRide.driverName}...
              </p>
            </div>
          </div>
          <span className="font-mono tabular-nums text-xs font-black bg-[var(--bg-sheet)] text-[var(--text-primary)] px-3 py-1.5 rounded-full">
            {formatNgn(bookedSuccessRide.fuelSplitNgn)}
          </span>
        </div>
      )}

      {/* Street Picker Modal */}
      {!isBackgroundUnderlay && showStreetPicker && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="w-full max-w-[400px] floating-surface rounded-[32px] p-5 space-y-3.5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-display font-black text-[var(--text-primary)]">
                  Pickup Street
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Find carpool rides passing your street
                </p>
              </div>
              <button
                onClick={() => setShowStreetPicker(false)}
                className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#525866] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search street, estate, or area..."
                value={searchStreetText}
                onChange={(e) => setSearchStreetText(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-subtle)] rounded-full text-xs font-semibold text-[var(--text-primary)] focus:outline-hidden"
              />
            </div>

            <button
              onClick={() => {
                setShowStreetPicker(false);
                handleLocateMe();
              }}
              className="w-full py-3 px-4 btn-volt text-xs font-extrabold rounded-full flex items-center justify-center gap-2 active-press"
            >
              <Crosshair className="w-4 h-4" />
              <span>Use Current GPS Location</span>
            </button>

            <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[280px] pr-1 no-scrollbar">
              {filteredLocations.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    triggerHaptic('tap');
                    setUserStreet(st);
                    setShowStreetPicker(false);
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([st.coordinates.lat, st.coordinates.lng], 14);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center justify-between active-press ${
                    userStreet.id === st.id
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-fg)]'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                  }`}
                >
                  <div>
                    <span className="text-xs font-extrabold block">{st.name}</span>
                    <span className="text-[10px] opacity-70">{st.area}</span>
                  </div>
                  {userStreet.id === st.id && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Destination Picker Modal */}
      {!isBackgroundUnderlay && showDestPicker && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="w-full max-w-[400px] floating-surface rounded-[32px] p-5 space-y-3.5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-display font-black text-[var(--text-primary)]">
                  Drop-off Hub
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Filter drivers heading your way
                </p>
              </div>
              <button
                onClick={() => setShowDestPicker(false)}
                className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[340px] pr-1 no-scrollbar">
              {[
                { id: 'all', title: 'Anywhere / Show All Rides', desc: 'See all drivers near your street' },
                { id: 'Victoria Island', title: 'Victoria Island', desc: 'Civic Center, Adeola Odeku, Eko Hotel' },
                { id: 'Ikeja', title: 'Ikeja / Airport', desc: 'Ikeja City Mall, Allen Ave, GRA, MM2' },
                { id: 'Marina', title: 'Marina / CMS', desc: 'Financial District, Broad Street, CMS Ferry' },
                { id: 'Yaba', title: 'Yaba / Tech Cluster', desc: 'Herbert Macaulay, Unilag, Sabo' },
                { id: 'Landmark', title: 'Landmark Beach / Oniru', desc: 'Water Corporation Dr, Shiro, Beach' },
                { id: 'Lekki Phase 1', title: 'Lekki Phase 1', desc: 'Admiralty Way, Freedom Way, Maroko' },
              ].map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => {
                    triggerHaptic('tap');
                    setSelectedDestination(dest.id);
                    setShowDestPicker(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center justify-between active-press ${
                    selectedDestination === dest.id
                      ? 'bg-[var(--accent-primary)] text-[var(--accent-primary-fg)]'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                  }`}
                >
                  <div>
                    <span className="text-xs font-extrabold block">{dest.title}</span>
                    <span className="text-[10px] opacity-70">{dest.desc}</span>
                  </div>
                  {selectedDestination === dest.id && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
