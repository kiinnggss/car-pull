'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { StreetCarpoolRide, StreetLocation, NeighborhoodRider } from '@/lib/types';
import {
  MapPin,
  Car,
  Compass,
  CheckCircle2,
  Navigation,
  Clock,
  ArrowRight,
  X,
  Star,
  Users,
  MessageCircle,
  Sparkles,
  Search,
  Crosshair,
  Filter,
  Calendar,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { formatNgn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { triggerHaptic } from '@/lib/haptics';

export const CorridorMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const polylinesRef = useRef<any[]>([]);

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
    activeRole,
    postDriverStreetRide,
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

  // Filter everyday rides based on destination and day filter
  const filteredRides = useMemo(() => {
    return everydayRides.filter((ride) => {
      // Destination filter
      if (selectedDestination !== 'all') {
        const matchesDest =
          ride.destination.toLowerCase().includes(selectedDestination.toLowerCase()) ||
          selectedDestination.toLowerCase().includes(ride.destination.toLowerCase());
        if (!matchesDest) return false;
      }

      // Day filter
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

  // If no ride selected, default to the first matching ride that passes near user
  useEffect(() => {
    if (!selectedRide && filteredRides.length > 0) {
      const nearest = filteredRides.find((r) => r.passesNearUser) || filteredRides[0];
      setSelectedRide(nearest);
    }
  }, [filteredRides, selectedRide]);

  // Leaflet map initialization
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Center map around user's street
      const initialCenter: [number, number] = [userStreet.coordinates.lat, userStreet.coordinates.lng];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 13,
        minZoom: 10,
        maxZoom: 18,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // OpenStreetMap standard tiles
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Map click handler: allows tapping anywhere on the map to set your street pin
      map.on('click', (e: any) => {
        triggerHaptic('tap');
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        // Find nearest known street location or name it
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
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Re-render markers and polylines whenever userStreet or filteredRides change
  useEffect(() => {
    async function updateLayers() {
      if (!mapInstanceRef.current) return;
      const L = (await import('leaflet')).default;
      renderMapElements(L, mapInstanceRef.current);
    }
    updateLayers();
  }, [userStreet, filteredRides, selectedRide]);

  const renderMapElements = (L: any, map: any) => {
    // Clear previous polylines & markers
    polylinesRef.current.forEach((p) => p.remove());
    polylinesRef.current = [];

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    const userCoords: [number, number] = [userStreet.coordinates.lat, userStreet.coordinates.lng];

    // 1. User Street Pin with 500m walking radius halo
    const userWalkingCircle = L.circle(userCoords, {
      radius: 400,
      color: '#0D6E6E',
      fillColor: '#14B8A6',
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: '4, 4',
    }).addTo(map);
    polylinesRef.current.push(userWalkingCircle);

    const userPinHtml = `
      <div class="relative flex flex-col items-center">
        <span class="absolute -inset-2 rounded-full bg-emerald-400/40 animate-ping"></span>
        <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-emerald-400 z-20">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <span class="mt-1 bg-stone-900 text-white px-2 py-0.5 rounded-full text-[9px] font-black border border-stone-700 shadow-md whitespace-nowrap z-20">
          Your Street
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

    // 2. Draw Everyday Carpool Routes & Drivers
    filteredRides.forEach((ride) => {
      const isSelected = selectedRide?.id === ride.id;
      const isPasses = ride.passesNearUser;

      // Polyline styles
      const routeColor = isSelected ? '#0D6E6E' : isPasses ? '#14B8A6' : '#8B5CF6';
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

      // Driver vehicle marker at route origin / current spot
      const driverCoords = ride.routePath[0];
      const vehicleHtml = `
        <div class="relative flex flex-col items-center cursor-pointer transform hover:scale-110 transition-transform">
          ${isSelected ? '<span class="absolute -inset-2 rounded-full bg-teal-400/50 animate-ping"></span>' : ''}
          <div class="relative w-8 h-8 rounded-full border-2 ${isSelected ? 'border-amber-400 ring-2 ring-teal-500' : 'border-white'} bg-stone-900 shadow-md overflow-hidden">
            <img src="${ride.driverAvatar}" class="w-full h-full object-cover" alt="${ride.driverName}" />
            <div class="absolute bottom-0 right-0 bg-[#0D6E6E] text-white p-0.5 rounded-tl-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/>
                <path d="M9 17h6"/>
                <circle cx="17" cy="17" r="2"/>
              </svg>
            </div>
          </div>
          <span class="mt-0.5 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 px-1.5 py-0.2 rounded text-[8px] font-black border border-stone-300 dark:border-stone-700 shadow-xs whitespace-nowrap">
            ${ride.driverName.split(' ')[0]} • ${ride.availableSeats} seat${ride.availableSeats === 1 ? '' : 's'}
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

    // 3. Neighbors on nearby streets waiting for rides
    neighborhoodRiders.forEach((rider) => {
      const riderHtml = `
        <div class="relative flex flex-col items-center cursor-pointer transform hover:scale-110 transition-transform">
          <div class="w-6 h-6 rounded-full border-2 border-amber-400 bg-stone-900 overflow-hidden shadow-sm">
            <img src="${rider.avatar}" class="w-full h-full object-cover" alt="${rider.name}" />
          </div>
          <span class="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-1 rounded text-[7px] font-bold border border-amber-300 whitespace-nowrap">
            Co-Rider: ${rider.name.split(' ')[0]}
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

  // Center on user's current GPS location
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
          // Fallback to Lekki Phase 1
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
      colors: ['#0D6E6E', '#14B8A6', '#F59E0B'],
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
    <div className="relative w-full h-[calc(100vh-125px)] min-h-[500px] flex flex-col bg-[#F6F2EA] dark:bg-[#121110] overflow-hidden">
      {/* Top Floating Transit Command Strip */}
      <div className="absolute top-2 left-2 right-2 z-[500] space-y-1.5 max-w-[420px] mx-auto">
        {/* Discovery View Switcher: Swipe Cards vs Street Map */}
        <div className="w-full flex bg-white/95 dark:bg-[#1C1A17]/95 backdrop-blur-md p-1 rounded-2xl border border-[#DDD4C5] dark:border-stone-800 shadow-md">
          <button
            onClick={() => {
              triggerHaptic('switch');
              setActiveTab('deck');
            }}
            className="flex-1 py-1 px-3 rounded-xl text-xs font-bold transition-all text-[#70665A] dark:text-stone-400 hover:text-[#141210] dark:hover:text-stone-200 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Swipe Cards</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className="flex-1 py-1 px-3 rounded-xl text-xs font-black transition-all bg-[#0D6E6E] dark:bg-[#14B8A6] text-white dark:text-stone-950 shadow-xs flex items-center justify-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Street Map</span>
          </button>
        </div>

        {/* Origin Street & Destination Selectors */}
        <div className="bg-white/95 dark:bg-[#1C1A17]/95 backdrop-blur-md rounded-2xl p-2 border border-[#DDD4C5] dark:border-stone-800 shadow-md space-y-1.5">
          {/* Row 1: Your Street Selector */}
          <div className="flex items-center justify-between gap-1.5">
            <button
              onClick={() => {
                triggerHaptic('tap');
                setShowStreetPicker(true);
              }}
              className="flex-1 flex items-center gap-2 px-2.5 py-1.5 bg-[#FAF6EE] dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-[#DDD4C5] dark:border-stone-700 rounded-xl text-left transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] uppercase font-bold text-[#70665A] dark:text-stone-400 block leading-tight">
                  Your Street / Pickup Pin
                </span>
                <span className="text-xs font-bold text-[#141210] dark:text-stone-100 truncate block">
                  {userStreet.name}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#70665A] dark:text-stone-400 flex-shrink-0" />
            </button>

            {/* Locate Me GPS Button */}
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className="p-2.5 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-[#0D6E6E] dark:text-[#14B8A6] border border-teal-200 dark:border-teal-800 rounded-xl active-press transition-all flex-shrink-0"
              title="Pin my current GPS street"
            >
              <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Row 2: "Going To" Destination Selector */}
          <div className="flex items-center justify-between gap-1.5">
            <button
              onClick={() => {
                triggerHaptic('tap');
                setShowDestPicker(true);
              }}
              className="flex-1 flex items-center gap-2 px-2.5 py-1.5 bg-[#FAF6EE] dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-[#DDD4C5] dark:border-stone-700 rounded-xl text-left transition-colors"
            >
              <Compass className="w-4 h-4 text-[#0D6E6E] dark:text-[#14B8A6] flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] uppercase font-bold text-[#70665A] dark:text-stone-400 block leading-tight">
                  Going My Way To
                </span>
                <span className="text-xs font-bold text-[#141210] dark:text-stone-100 truncate block">
                  {selectedDestination === 'all' ? 'Everywhere / Any Destination' : selectedDestination}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#70665A] dark:text-stone-400 flex-shrink-0" />
            </button>

            {selectedDestination !== 'all' && (
              <button
                onClick={() => setSelectedDestination('all')}
                className="px-2 py-1 bg-stone-100 dark:bg-stone-800 text-[10px] font-bold text-stone-600 dark:text-stone-300 rounded-lg hover:bg-stone-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Row 3: Day & Timing Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
            {[
              { id: 'all', label: 'All Days' },
              { id: 'now', label: '⚡ Leaving Now' },
              { id: 'today', label: 'Today' },
              { id: 'tomorrow', label: 'Tomorrow' },
              { id: 'weekend', label: 'This Weekend' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => {
                  triggerHaptic('tap');
                  setSelectedDayFilter(chip.id as any);
                }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all active-press ${
                  selectedDayFilter === chip.id
                    ? 'bg-[#0D6E6E] dark:bg-[#14B8A6] text-white dark:text-stone-900 shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800/80 text-[#70665A] dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Street Tap Hint Banner */}
        <div className="bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-medium py-1 px-3 rounded-xl flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Tap anywhere on the map to set your street pin
          </span>
          <span className="font-bold text-teal-300">
            {filteredRides.length} ride{filteredRides.length === 1 ? '' : 's'} near you
          </span>
        </div>
      </div>

      {/* Main Full-Bleed Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Bottom Floating Street Ride Card */}
      {selectedRide && !bookedSuccessRide && (
        <div className="absolute bottom-2 left-2 right-2 z-[500] max-w-[420px] mx-auto animate-in slide-in-from-bottom duration-200">
          <div className="bg-white/98 dark:bg-[#1C1A17]/98 backdrop-blur-md rounded-2xl border border-[#DDD4C5] dark:border-stone-800 shadow-xl p-3 space-y-2 text-[#141210] dark:text-stone-100">
            {/* Top row: Driver, Car, Fuel Split */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedRide.driverAvatar}
                  alt={selectedRide.driverName}
                  className="w-10 h-10 rounded-xl object-cover border border-[#DDD4C5] dark:border-stone-700"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-serif font-black">{selectedRide.driverName}</h4>
                    <span className="text-[9px] bg-teal-50 dark:bg-teal-950 text-[#0D6E6E] dark:text-[#14B8A6] font-bold px-1.5 py-0.2 rounded border border-teal-200 dark:border-teal-800">
                      ★ {selectedRide.driverRating}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#70665A] dark:text-stone-400 font-medium block">
                    {selectedRide.driverRole}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-[#0D6E6E] dark:text-[#14B8A6] block">
                  {formatNgn(selectedRide.fuelSplitNgn)}
                </span>
                <span className="text-[9px] uppercase font-mono text-[#70665A] dark:text-stone-400">
                  Fair Share Split
                </span>
              </div>
            </div>

            {/* Route & Pickup Corner Callout */}
            <div className="bg-[#FAF6EE] dark:bg-stone-900 border border-[#DDD4C5] dark:border-stone-800 rounded-xl p-2 text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {selectedRide.pickupStreetCorner}
                </span>
                <span className="text-[10px] font-semibold text-[#70665A] dark:text-stone-400">
                  ~{selectedRide.pickupWalkMinutes} min walk
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#70665A] dark:text-stone-400 pt-0.5 border-t border-[#DDD4C5]/60 dark:border-stone-800">
                <span className="flex items-center gap-1 font-semibold text-stone-800 dark:text-stone-200">
                  <ArrowRight className="w-3 h-3 text-[#0D6E6E] dark:text-[#14B8A6]" />
                  Heading to: <strong>{selectedRide.destination}</strong>
                </span>
                <span className="flex items-center gap-1 font-mono font-bold text-amber-600 dark:text-amber-400">
                  <Clock className="w-3 h-3" />
                  {selectedRide.departureDay} • {selectedRide.departureTime}
                </span>
              </div>
            </div>

            {/* Vehicle & Available Seats */}
            <div className="flex items-center justify-between text-[10px] text-[#70665A] dark:text-stone-400 px-1">
              <span className="flex items-center gap-1 font-semibold">
                <Car className="w-3.5 h-3.5 text-[#0D6E6E] dark:text-[#14B8A6]" />
                {selectedRide.vehicle.make} {selectedRide.vehicle.model} ({selectedRide.vehicle.color}) • {selectedRide.vehicle.plateNumber}
              </span>
              <span className="font-bold text-teal-700 dark:text-teal-400">
                {selectedRide.availableSeats} of {selectedRide.totalSeats} seats open
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              <button
                onClick={() => handleBookRide(selectedRide)}
                className="col-span-2 py-2.5 bg-[#0D6E6E] hover:bg-[#094E4E] text-white dark:text-stone-950 dark:bg-[#14B8A6] text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-md active-press transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300 dark:text-stone-900" />
                <span>Join Carpool • {formatNgn(selectedRide.fuelSplitNgn)}</span>
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
                className="py-2.5 bg-[#FAF6EE] dark:bg-stone-800 hover:bg-stone-100 text-[#0D6E6E] dark:text-[#14B8A6] border border-[#DDD4C5] dark:border-stone-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1 active-press transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Success Banner */}
      {bookedSuccessRide && (
        <div className="absolute bottom-4 left-3 right-3 z-[500] max-w-[400px] mx-auto bg-emerald-600 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between animate-in zoom-in-95">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-white" />
            <div>
              <h4 className="text-xs font-black">Seat Reserved!</h4>
              <p className="text-[10px] text-emerald-100">
                Opening chat with {bookedSuccessRide.driverName}...
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-black bg-emerald-700 px-2 py-1 rounded-lg">
            {formatNgn(bookedSuccessRide.fuelSplitNgn)} Held
          </span>
        </div>
      )}

      {/* Street Picker Modal */}
      {showStreetPicker && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-xs flex items-end justify-center p-3 animate-in fade-in">
          <div className="w-full max-w-[400px] bg-white dark:bg-[#1C1A17] rounded-3xl p-4 border border-[#DDD4C5] dark:border-stone-800 shadow-2xl space-y-3 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-serif font-black text-[#141210] dark:text-stone-100">
                  Select Your Street / Area
                </h3>
                <p className="text-[11px] text-[#70665A] dark:text-stone-400">
                  Find carpool rides departing from or passing your street
                </p>
              </div>
              <button
                onClick={() => setShowStreetPicker(false)}
                className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search street, estate, or neighborhood..."
                value={searchStreetText}
                onChange={(e) => setSearchStreetText(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FAF6EE] dark:bg-stone-900 border border-[#DDD4C5] dark:border-stone-700 rounded-xl text-xs text-[#141210] dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-[#0D6E6E]"
              />
            </div>

            {/* Quick GPS Location Option */}
            <button
              onClick={() => {
                setShowStreetPicker(false);
                handleLocateMe();
              }}
              className="w-full py-2 px-3 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100/80 text-[#0D6E6E] dark:text-[#14B8A6] text-xs font-bold rounded-xl border border-teal-200 dark:border-teal-800 flex items-center justify-center gap-2"
            >
              <Crosshair className="w-4 h-4" />
              <span>Use Current GPS Location</span>
            </button>

            {/* Street List */}
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
                  className={`w-full text-left p-2.5 rounded-xl border transition-colors flex items-start justify-between ${
                    userStreet.id === st.id
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-700'
                      : 'bg-[#FAF6EE] dark:bg-stone-900/60 border-[#DDD4C5] dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-[#141210] dark:text-stone-100 block">
                      {st.name}
                    </span>
                    <span className="text-[10px] text-[#70665A] dark:text-stone-400 font-medium">
                      {st.area}
                    </span>
                  </div>
                  {userStreet.id === st.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Destination Picker Modal */}
      {showDestPicker && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-xs flex items-end justify-center p-3 animate-in fade-in">
          <div className="w-full max-w-[400px] bg-white dark:bg-[#1C1A17] rounded-3xl p-4 border border-[#DDD4C5] dark:border-stone-800 shadow-2xl space-y-3 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-serif font-black text-[#141210] dark:text-stone-100">
                  Where Are You Going?
                </h3>
                <p className="text-[11px] text-[#70665A] dark:text-stone-400">
                  Filter drivers whose route is heading your way
                </p>
              </div>
              <button
                onClick={() => setShowDestPicker(false)}
                className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Common Destinations List */}
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
                  className={`w-full text-left p-2.5 rounded-xl border transition-colors flex items-start justify-between ${
                    selectedDestination === dest.id
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-700'
                      : 'bg-[#FAF6EE] dark:bg-stone-900/60 border-[#DDD4C5] dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-[#141210] dark:text-stone-100 block">
                      {dest.title}
                    </span>
                    <span className="text-[10px] text-[#70665A] dark:text-stone-400 font-medium">
                      {dest.desc}
                    </span>
                  </div>
                  {selectedDestination === dest.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
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
