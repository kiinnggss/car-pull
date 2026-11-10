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
import confetti from 'canvas-confetti';
import { triggerHaptic } from '@/lib/haptics';
import type * as Leaflet from 'leaflet';

interface CorridorMapProps {
  isBackgroundUnderlay?: boolean;
}

export const CorridorMap: React.FC<CorridorMapProps> = ({ isBackgroundUnderlay = false }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Leaflet.Map | null>(null);
  const markersRef = useRef<{ [key: string]: Leaflet.Layer }>({});
  const polylinesRef = useRef<Leaflet.Layer[]>([]);

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
  } = useAppStore();

  const [selectedRide, setSelectedRide] = useState<StreetCarpoolRide | null>(null);
  const [selectedRider, setSelectedRider] = useState<NeighborhoodRider | null>(null);
  const [showStreetPicker, setShowStreetPicker] = useState(false);
  const [showDestPicker, setShowDestPicker] = useState(false);
  const [searchStreetText, setSearchStreetText] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [bookedSuccessRide, setBookedSuccessRide] = useState<StreetCarpoolRide | null>(null);

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

    const userCoords: [number, number] = [userStreet.coordinates.lat, userStreet.coordinates.lng];

    const userWalkingCircle = L.circle(userCoords, {
      radius: 400,
      color: '#0F766E',
      fillColor: '#14B8A6',
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: '4, 4',
    }).addTo(map);
    polylinesRef.current.push(userWalkingCircle);

    const userPinHtml = `
      <div class="relative flex flex-col items-center">
        <span class="absolute -inset-2 rounded-full bg-emerald-400/40 animate-ping"></span>
        <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg ring-2 ring-emerald-400 z-20">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <span class="mt-1 bg-slate-900/95 text-white px-2 py-0.5 rounded-md text-[9px] font-mono font-black shadow-md whitespace-nowrap z-20">
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

      const routeColor = isSelected ? '#0F766E' : isPasses ? '#14B8A6' : '#64748B';
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

      const driverCoords = ride.routePath[0];
      const vehicleHtml = `
        <div class="relative flex flex-col items-center cursor-pointer transform hover:scale-110 transition-transform">
          ${isSelected ? '<span class="absolute -inset-2 rounded-full bg-teal-400/50 animate-ping"></span>' : ''}
          <div class="relative w-8 h-8 rounded-full ${isSelected ? 'ring-2 ring-amber-400' : ''} bg-slate-900 shadow-md overflow-hidden">
            <img src="${ride.driverAvatar}" class="w-full h-full object-cover" alt="${ride.driverName}" />
            <div class="absolute bottom-0 right-0 bg-[#0F766E] text-white p-0.5 rounded-tl-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/>
                <path d="M9 17h6"/>
                <circle cx="17" cy="17" r="2"/>
              </svg>
            </div>
          </div>
          <span class="mt-0.5 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 px-1.5 py-0.5 rounded text-[8px] font-mono font-black shadow-xs whitespace-nowrap">
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
    });

    neighborhoodRiders.forEach((rider) => {
      const riderHtml = `
        <div class="relative flex flex-col items-center cursor-pointer transform hover:scale-110 transition-transform">
          <div class="w-6 h-6 rounded-full bg-slate-900 overflow-hidden shadow-sm">
            <img src="${rider.avatar}" class="w-full h-full object-cover" alt="${rider.name}" />
          </div>
          <span class="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-1 rounded text-[7px] font-mono font-bold shadow-xs whitespace-nowrap">
            CO-RIDER: ${rider.name.split(' ')[0].toUpperCase()}
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

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#0F766E', '#14B8A6', '#F59E0B'],
    });

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
    <div className="relative w-full h-full min-h-[500px] flex flex-col bg-transparent overflow-hidden">
      {/* Top Floating Transit Command Strip (Only shown in full map mode) */}
      {!isBackgroundUnderlay && (
        <div className="absolute top-2.5 left-2.5 right-2.5 z-[500] max-w-[420px] mx-auto space-y-2 animate-in fade-in duration-200">
          <div className="floating-surface rounded-2xl p-1.5 flex items-center gap-1">
            <button
              onClick={() => {
                triggerHaptic('tap');
                setShowStreetPicker(true);
              }}
              className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left transition-all active-spring hover:bg-slate-100 dark:hover:bg-[#171F29]"
              title="Tap to change origin pickup street"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[8.5px] font-mono uppercase font-bold text-slate-400 block leading-none">
                  PICKUP
                </span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate block mt-0.5">
                  {userStreet.name.split(',')[0]}
                </span>
              </div>
            </button>

            <div className="flex items-center justify-center px-1 text-slate-400 dark:text-slate-500">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>

            <button
              onClick={() => {
                triggerHaptic('tap');
                setShowDestPicker(true);
              }}
              className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left transition-all active-spring hover:bg-slate-100 dark:hover:bg-[#171F29]"
              title="Tap to filter destination"
            >
              <Compass className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6] flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[8.5px] font-mono uppercase font-bold text-slate-400 block leading-none">
                  DESTINATION
                </span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate block mt-0.5">
                  {selectedDestination === 'all' ? 'Any Corridor' : selectedDestination}
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                triggerHaptic('switch');
                setActiveTab('deck');
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 active-spring flex-shrink-0 hover:bg-slate-100 dark:hover:bg-[#171F29]"
              title="Switch to Swipe Cards deck"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
            </button>
          </div>

          {/* Compact Day Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-0.5">
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
                className={`px-3 py-1 rounded-xl text-[10.5px] font-bold whitespace-nowrap transition-all active-spring ${
                  selectedDayFilter === chip.id
                    ? 'btn-electric-mint'
                    : 'floating-pill text-slate-700 dark:text-slate-300'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Full-Bleed Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Bottom-Right Floating GPS FAB */}
      {!isBackgroundUnderlay && (
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="absolute bottom-24 right-3 z-30 w-10 h-10 rounded-xl floating-pill text-[#0F766E] dark:text-[#14B8A6] flex items-center justify-center active-spring"
          title="Pin my current GPS street"
        >
          <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
        </button>
      )}

      {/* Bottom Floating Street Ride Card */}
      {!isBackgroundUnderlay && selectedRide && !bookedSuccessRide && (
        <div className="absolute bottom-[4.75rem] left-2.5 right-2.5 z-30 max-w-[420px] mx-auto animate-in slide-in-from-bottom duration-200">
          <div className="floating-surface rounded-2xl overflow-hidden text-slate-900 dark:text-slate-100">
            {/* Top row: Driver, Car, Fuel Split */}
            <div className="p-3.5 flex items-start justify-between border-b border-slate-200/70 dark:border-white/8">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-mono font-bold text-xs border border-slate-200/80 dark:border-white/10 flex-shrink-0 overflow-hidden">
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
                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                      {selectedRide.driverName}
                    </h4>
                    <span className="text-[9px] bg-teal-500/12 border border-teal-500/20 text-[#0F766E] dark:text-[#14B8A6] font-bold px-1.5 py-0.5 rounded-md font-mono tabular-nums flex-shrink-0">
                      ★ {selectedRide.driverRating}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium truncate block">
                    {selectedRide.driverRole}
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-sm font-black text-[#0F766E] dark:text-[#14B8A6] font-mono tabular-nums block">
                  {formatNgn(selectedRide.fuelSplitNgn)}
                </span>
                <span className="text-[8.5px] uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">
                  FAIR SPLIT
                </span>
              </div>
            </div>

            {/* Route & Pickup Corner Callout */}
            <div className="px-3.5 py-2.5 bg-slate-50/70 dark:bg-[#0D1218]/60 border-b border-slate-200/70 dark:border-white/8 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 truncate">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{selectedRide.pickupStreetCorner}</span>
                </span>
                <span className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400 flex-shrink-0">
                  ~{selectedRide.pickupWalkMinutes}m walk
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200 truncate">
                  <ArrowRight className="w-3 h-3 text-[#0F766E] dark:text-[#14B8A6] flex-shrink-0" />
                  <span>To:</span>
                  <strong className="text-slate-900 dark:text-slate-100 truncate">{selectedRide.destination}</strong>
                </span>
                <span className="flex items-center gap-1 font-mono font-bold text-amber-600 dark:text-amber-400 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {selectedRide.departureDay}, {selectedRide.departureTime}
                </span>
              </div>
            </div>

            {/* Vehicle & Action Bar */}
            <div className="p-3 space-y-2.5">
              <div className="flex items-center justify-between text-[10.5px] text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-bold truncate">
                  <Car className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6] flex-shrink-0" />
                  <span>{selectedRide.vehicle.make} {selectedRide.vehicle.model}</span>
                  <span className="plate-badge">{selectedRide.vehicle.plateNumber}</span>
                </span>
                <span className="font-bold text-[#0F766E] dark:text-[#14B8A6] font-mono tabular-nums text-[10px] flex-shrink-0">
                  {selectedRide.availableSeats}/{selectedRide.totalSeats} SEATS
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBookRide(selectedRide)}
                  className="flex-1 py-2.5 btn-electric-mint rounded-xl flex items-center justify-center gap-1.5 active-spring text-xs font-black"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    Join Carpool •{' '}
                    <span className="font-mono tabular-nums">{formatNgn(selectedRide.fuelSplitNgn)}</span>
                  </span>
                </button>

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
                  className="px-3.5 py-2.5 bg-slate-100 dark:bg-[#171F29] hover:bg-slate-200/70 dark:hover:bg-[#1E2936] border border-slate-200/80 dark:border-white/10 text-[#0F766E] dark:text-[#14B8A6] text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 active-spring"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Success Banner */}
      {!isBackgroundUnderlay && bookedSuccessRide && (
        <div className="absolute bottom-[4.75rem] left-3 right-3 z-30 max-w-[400px] mx-auto bg-emerald-600 text-white rounded-2xl p-3.5 border border-emerald-400/40 flex items-center justify-between animate-in zoom-in-95">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <div>
              <h4 className="text-xs font-black">Seat Reserved</h4>
              <p className="text-[10px] text-emerald-100">
                Opening chat with {bookedSuccessRide.driverName}...
              </p>
            </div>
          </div>
          <span className="font-mono tabular-nums text-xs font-black bg-black/20 px-2 py-1 rounded-lg">
            {formatNgn(bookedSuccessRide.fuelSplitNgn)} HELD
          </span>
        </div>
      )}

      {/* Street Picker Modal */}
      {!isBackgroundUnderlay && showStreetPicker && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="w-full max-w-[400px] floating-surface rounded-2xl p-4 space-y-3 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-white/8">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  Select Pickup Street
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Find carpool rides passing your neighborhood
                </p>
              </div>
              <button
                onClick={() => setShowStreetPicker(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#171F29] text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search street, estate, or neighborhood..."
                value={searchStreetText}
                onChange={(e) => setSearchStreetText(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-100 dark:bg-[#171F29] border border-slate-200/80 dark:border-white/8 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            <button
              onClick={() => {
                setShowStreetPicker(false);
                handleLocateMe();
              }}
              className="w-full py-2.5 px-3 btn-electric-mint text-xs font-black rounded-xl flex items-center justify-center gap-2 active-spring transition-all"
            >
              <Crosshair className="w-4 h-4" />
              <span>Use Current GPS Location</span>
            </button>

            <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[300px] pr-1">
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
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start justify-between active-spring ${
                    userStreet.id === st.id
                      ? 'bg-teal-500/12 border-teal-500/30 text-[#0F766E] dark:text-[#14B8A6]'
                      : 'bg-slate-50 dark:bg-[#171F29] border-slate-200/70 dark:border-white/8 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      {st.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {st.area}
                    </span>
                  </div>
                  {userStreet.id === st.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Destination Picker Modal */}
      {!isBackgroundUnderlay && showDestPicker && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="w-full max-w-[400px] floating-surface rounded-2xl p-4 space-y-3 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-white/8">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  Select Corridor Destination
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Filter drivers heading toward your commercial hub
                </p>
              </div>
              <button
                onClick={() => setShowDestPicker(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#171F29] text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[350px] pr-1">
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
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start justify-between active-spring ${
                    selectedDestination === dest.id
                      ? 'bg-teal-500/12 border-teal-500/30 text-[#0F766E] dark:text-[#14B8A6]'
                      : 'bg-slate-50 dark:bg-[#171F29] border-slate-200/70 dark:border-white/8 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      {dest.title}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {dest.desc}
                    </span>
                  </div>
                  {selectedDestination === dest.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
