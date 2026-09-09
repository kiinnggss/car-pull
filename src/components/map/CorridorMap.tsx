'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { SafeZone, CorridorDriver, TrafficAlert } from '@/lib/types';
import {
  MapPin,
  ShieldCheck,
  Car,
  Compass,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Clock,
  Flame,
  ArrowRight,
  Maximize2,
  X,
  Star,
} from 'lucide-react';
import { formatNgn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { RoutePlannerBar } from '../carpool/RoutePlannerBar';

// Lagos Ajah -> Lekki Toll -> Victoria Island -> Marina Expressway Polyline
const LAGOS_CORRIDOR_COORDS: [number, number][] = [
  [6.4678, 3.5683], // Ajah Jubilee Bridge / Langbasa
  [6.4552, 3.5594], // VGC Security Bay
  [6.4485, 3.5385], // Chevron Drive Junction
  [6.4428, 3.5186], // Jakande / TotalEnergies Mega Station
  [6.4395, 3.5012], // Agungi Bus Stop
  [6.4380, 3.4885], // Igbo-Efon / Chisco
  [6.4372, 3.4750], // Ikate Elegushi
  [6.4360, 3.4610], // Maroko / Lekki Phase 1
  [6.4312, 3.4510], // Mobil Sandfill
  [6.4420, 3.4430], // Lekki 1st Toll Gate (Admiralty)
  [6.4460, 3.4350], // Lekki-Ikoyi Link Bridge / Falomo Roundabout
  [6.4350, 3.4280], // Ozumba Mbadiwe / Civic Center
  [6.4300, 3.4210], // Adeola Odeku / Ahmadu Bello Way
  [6.4400, 3.4080], // Bonny Camp / CMS Marina Approach
  [6.4530, 3.3958], // Marina Terminal / CMS
];

// Lekki 1st Toll bottleneck congestion coordinates
const TOLL_BOTTLENECK_COORDS: [number, number][] = [
  [6.4360, 3.4610],
  [6.4312, 3.4510],
  [6.4420, 3.4430],
];

// Live driver approximate locations along the corridor (staggered to avoid pin overlaps)
const DRIVER_GEO_LOCATIONS: { [id: string]: [number, number] } = {
  'driver-101': [6.4405, 3.5040], // Between Jakande & Agungi
  'driver-102': [6.4465, 3.5320], // Near Chevron Drive
  'driver-103': [6.4520, 3.5510], // Near VGC
  'driver-104': [6.4340, 3.4570], // Near Sandfill / Lekki Phase 1
  'driver-105': [6.4315, 3.4240], // Near Ozumba Mbadiwe / VI
};

export const CorridorMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<'all' | 'safezones' | 'drivers' | 'traffic'>('all');
  const [inspectedZone, setInspectedZone] = useState<SafeZone | null>(null);
  const [inspectedDriver, setInspectedDriver] = useState<CorridorDriver | null>(null);
  const [inspectedAlert, setInspectedAlert] = useState<TrafficAlert | null>(null);

  const {
    safeZones,
    selectedSafeZone,
    setSelectedSafeZone,
    drivers,
    selectDriverById,
    trafficAlerts,
    commuteDirection,
    toggleCommuteDirection,
    setActiveTab,
    riderRoute,
  } = useAppStore();

  // Initialize interactive Leaflet map inside useEffect
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      // Check if map instance is already bound to the container
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map centered on the Lekki-Epe expressway corridor
      const map = L.map(mapContainerRef.current, {
        center: [6.443, 3.488],
        zoom: 12,
        minZoom: 10,
        maxZoom: 17,
        zoomControl: false,
      });

      // Position zoom control in top-right for mobile thumb friendliness
      L.control.zoom({ position: 'topright' }).addTo(map);

      // OpenStreetMap standard tiles: Zero watermark, 100% free and open
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Glow halo corridor path
      L.polyline(LAGOS_CORRIDOR_COORDS, {
        color: '#C4B5FD',
        weight: 8,
        opacity: 0.6,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Main Electric Purple corridor route
      L.polyline(LAGOS_CORRIDOR_COORDS, {
        color: '#7C3AED',
        weight: 4,
        opacity: 0.9,
        dashArray: commuteDirection === 'morning' ? '8, 6' : undefined,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Amber/Red Bottleneck Congestion section around Lekki 1st Toll
      L.polyline(TOLL_BOTTLENECK_COORDS, {
        color: '#EF4444',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Layer groups for filtering
      const safeZoneLayer = L.layerGroup().addTo(map);
      const driverLayer = L.layerGroup().addTo(map);
      const trafficLayer = L.layerGroup().addTo(map);

      // Add Safe Zone CCTV Hub Markers
      safeZones.forEach((zone) => {
        const isSelected = zone.id === selectedSafeZone.id;
        const iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer transform hover:scale-110 transition-transform">
            ${isSelected ? '<span class="absolute -inset-2 rounded-full bg-amber-400/40 animate-ping"></span>' : ''}
            <div class="w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg border-2 ${
              isSelected
                ? 'bg-amber-500 border-white text-zinc-950 ring-2 ring-amber-400'
                : 'bg-[#7C3AED] border-white text-white'
            }">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span class="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white/95 px-1.5 py-0.5 rounded-md text-[9px] font-black text-zinc-900 border border-zinc-200 shadow-xs whitespace-nowrap">
              ${zone.name.split(' ')[0]}
            </span>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-safezone-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([zone.coordinates.lat, zone.coordinates.lng], { icon });
        marker.on('click', () => {
          setInspectedZone(zone);
          setInspectedDriver(null);
          setInspectedAlert(null);
        });
        safeZoneLayer.addLayer(marker);
      });

      // Add Active Corridor Drivers
      drivers.slice(0, 5).forEach((driver) => {
        const coords = DRIVER_GEO_LOCATIONS[driver.id] || [6.4428, 3.5186];
        const iconHtml = `
          <div class="relative flex flex-col items-center cursor-pointer transform hover:scale-110 transition-transform">
            <div class="relative w-9 h-9 rounded-2xl border-2 border-white bg-zinc-900 shadow-lg overflow-hidden ring-2 ring-[#7C3AED]/40">
              <img src="${driver.avatar}" class="w-full h-full object-cover" alt="${driver.name}" />
              <div class="absolute bottom-0 right-0 bg-[#7C3AED] text-white p-0.5 rounded-tl-md">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                  <circle cx="7" cy="17" r="2"/>
                  <path d="M9 17h6"/>
                  <circle cx="17" cy="17" r="2"/>
                </svg>
              </div>
            </div>
            <div class="mt-0.5 bg-zinc-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-xs border border-zinc-700 whitespace-nowrap flex items-center gap-1">
              <span>₦${driver.corridor.fuel_split_ngn.toLocaleString()}</span>
              <span class="text-emerald-400">● ${driver.corridor.available_seats}s</span>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-driver-pin',
          iconSize: [36, 44],
          iconAnchor: [18, 22],
        });

        const marker = L.marker(coords, { icon });
        marker.on('click', () => {
          setInspectedDriver(driver);
          setInspectedZone(null);
          setInspectedAlert(null);
        });
        driverLayer.addLayer(marker);
      });

      // Add Bottleneck / Traffic Hazard Marker at Lekki 1st Toll
      const tollAlert = trafficAlerts.find((a) => a.location.includes('Toll')) || trafficAlerts[0];
      if (tollAlert) {
        const alertHtml = `
          <div class="relative flex items-center justify-center cursor-pointer animate-bounce">
            <span class="absolute -inset-1 rounded-full bg-red-500/40 animate-ping"></span>
            <div class="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <span class="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-red-700 text-white px-1.5 py-0.5 rounded text-[8px] font-black shadow-xs whitespace-nowrap">
              +20m Toll Jam
            </span>
          </div>
        `;

        const alertIcon = L.divIcon({
          html: alertHtml,
          className: 'custom-traffic-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const alertMarker = L.marker([6.4385, 3.4470], { icon: alertIcon });
        alertMarker.on('click', () => {
          setInspectedAlert(tollAlert);
          setInspectedZone(null);
          setInspectedDriver(null);
        });
        trafficLayer.addLayer(alertMarker);
      }

      // Add Custom Rider Route Markers (Origin A and Destination B)
      if (riderRoute.originCoords) {
        const originHtml = `
          <div class="relative flex flex-col items-center cursor-pointer transform hover:scale-110 transition-transform">
            <span class="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping"></span>
            <div class="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-emerald-400">
              A
            </div>
            <span class="mt-0.5 bg-emerald-700 text-white text-[8px] font-black px-1.5 py-0.2 rounded shadow-xs whitespace-nowrap">
              PICKUP
            </span>
          </div>
        `;
        const originIcon = L.divIcon({
          html: originHtml,
          className: 'custom-origin-pin',
          iconSize: [32, 40],
          iconAnchor: [16, 20],
        });
        L.marker([riderRoute.originCoords.lat, riderRoute.originCoords.lng], { icon: originIcon })
          .addTo(map)
          .bindPopup(`<b>Pickup Location:</b><br/>${riderRoute.origin}`);
      }

      if (riderRoute.destinationCoords) {
        const destHtml = `
          <div class="relative flex flex-col items-center cursor-pointer transform hover:scale-110 transition-transform">
            <span class="absolute -inset-1 rounded-full bg-purple-500/40 animate-ping"></span>
            <div class="w-8 h-8 rounded-full bg-[#7C3AED] text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-purple-400">
              B
            </div>
            <span class="mt-0.5 bg-[#6D28D9] text-white text-[8px] font-black px-1.5 py-0.2 rounded shadow-xs whitespace-nowrap">
              DROPOFF
            </span>
          </div>
        `;
        const destIcon = L.divIcon({
          html: destHtml,
          className: 'custom-dest-pin',
          iconSize: [32, 40],
          iconAnchor: [16, 20],
        });
        L.marker([riderRoute.destinationCoords.lat, riderRoute.destinationCoords.lng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<b>Destination:</b><br/>${riderRoute.destination}`);
      }

      mapInstanceRef.current = map;
      if (isMounted) {
        setMapReady(true);
        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [selectedSafeZone.id, commuteDirection, riderRoute.origin, riderRoute.destination]);

  // Recenter map to view entire Lagos corridor
  const handleFitCorridor = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.fitBounds(LAGOS_CORRIDOR_COORDS, { padding: [30, 30] });
  };

  // Focus on current selected safe zone
  const handleFocusSelectedSafeZone = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(
      [selectedSafeZone.coordinates.lat, selectedSafeZone.coordinates.lng],
      14,
      { duration: 1.2 }
    );
    setInspectedZone(selectedSafeZone);
  };

  // Select safe zone as active pickup point with celebratory haptics
  const handleConfirmSafeZone = (zone: SafeZone) => {
    setSelectedSafeZone(zone);
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#7C3AED', '#F59E0B', '#10B981'],
    });
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[520px] flex flex-col bg-zinc-100 overflow-hidden">
      {/* Top Floating Control Bar */}
      <div className="absolute top-2 left-2 right-2 z-[500] flex flex-col gap-1.5 pointer-events-auto">
        {/* Segmented Controls: View Mode & Corridor Direction */}
        <div className="flex items-center justify-between gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-zinc-200/90">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('deck')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-zinc-500" />
              <span>Cards</span>
            </button>
            <button
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-[#7C3AED] text-white shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5 text-white" />
              <span>Live Map</span>
            </button>
          </div>

          {/* Commute Direction Quick Toggle */}
          <button
            onClick={toggleCommuteDirection}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold border transition-all ${
              commuteDirection === 'morning'
                ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                : 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100'
            }`}
            title="Tap to switch between AM Outbound and PM Return corridors"
          >
            <span>{commuteDirection === 'morning' ? 'AM: Ajah → VI' : 'PM: VI → Ajah'}</span>
            <span className="text-[9px] bg-white/80 px-1 py-0.2 rounded font-black">⇌</span>
          </button>
        </div>

        {/* Dynamic Route Planner Pill */}
        <RoutePlannerBar />

        {/* Quick Map Action Pills */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={handleFocusSelectedSafeZone}
              className="flex items-center gap-1 bg-white/95 text-zinc-800 text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-xs border border-zinc-200 hover:bg-zinc-50 active:scale-95 transition-all flex-shrink-0"
            >
              <ShieldCheck className="w-3 h-3 text-[#7C3AED]" />
              <span className="truncate max-w-[120px]">{selectedSafeZone.name.split(' ')[0]}</span>
            </button>
            <button
              onClick={handleFitCorridor}
              className="flex items-center gap-1 bg-white/95 text-zinc-800 text-[10px] font-bold px-2 py-1 rounded-xl shadow-xs border border-zinc-200 hover:bg-zinc-50 active:scale-95 transition-all flex-shrink-0"
              title="Fit entire Lagos corridor into view"
            >
              <Maximize2 className="w-3 h-3 text-zinc-600" />
              <span>Fit Route</span>
            </button>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              Live GPS
            </span>
          </div>
        </div>
      </div>

      {/* Primary Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 flex-1" />

      {/* Loading Skeleton if Map is rendering */}
      {!mapReady && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-50 gap-3">
          <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-zinc-600">Loading Lagos Corridor Map...</p>
        </div>
      )}

      {/* Floating Bottom Card: Inspected Safe Zone */}
      {inspectedZone && (
        <div className="absolute bottom-20 left-2 right-2 z-[500] bg-white rounded-3xl p-3.5 shadow-2xl border border-zinc-200 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between gap-2 border-b border-zinc-100 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-zinc-900 leading-tight">
                    {inspectedZone.name}
                  </h4>
                  {inspectedZone.id === selectedSafeZone.id && (
                    <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.2 rounded-full border border-emerald-300">
                      CURRENT
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 line-clamp-1">{inspectedZone.address}</p>
              </div>
            </div>
            <button
              onClick={() => setInspectedZone(null)}
              className="w-6 h-6 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center font-bold text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 my-2.5">
            <div className="bg-zinc-50 p-1.5 rounded-xl border border-zinc-200/60 text-center">
              <span className="text-[8px] text-zinc-500 block font-bold">CCTV Status</span>
              <span className="text-[10px] font-extrabold text-emerald-600">24/7 Verified</span>
            </div>
            <div className="bg-zinc-50 p-1.5 rounded-xl border border-zinc-200/60 text-center">
              <span className="text-[8px] text-zinc-500 block font-bold">Zone Type</span>
              <span className="text-[10px] font-extrabold text-zinc-800 capitalize">
                {inspectedZone.zone_type.replace('_', ' ')}
              </span>
            </div>
            <div className="bg-zinc-50 p-1.5 rounded-xl border border-zinc-200/60 text-center">
              <span className="text-[8px] text-zinc-500 block font-bold">Security Bay</span>
              <span className="text-[10px] font-extrabold text-purple-700">Off-Street</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {inspectedZone.id === selectedSafeZone.id ? (
              <div className="flex-1 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Selected as Active Pickup Point</span>
              </div>
            ) : (
              <button
                onClick={() => handleConfirmSafeZone(inspectedZone)}
                className="flex-1 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-98 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-[#7C3AED]/25 transition-all"
              >
                <MapPin className="w-4 h-4" />
                <span>Set as My Pickup Point</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('deck')}
              className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-2xl transition-colors"
            >
              View Drivers
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Card: Inspected Driver Carpool */}
      {inspectedDriver && (
        <div className="absolute bottom-20 left-2 right-2 z-[500] bg-white rounded-3xl p-3.5 shadow-2xl border border-zinc-200 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between gap-2 border-b border-zinc-100 pb-2">
            <div className="flex items-center gap-2.5">
              <img
                src={inspectedDriver.avatar}
                alt={inspectedDriver.name}
                className="w-11 h-11 rounded-2xl object-cover border border-zinc-200"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-zinc-900">{inspectedDriver.name}</h4>
                  <span className="text-[10px] text-zinc-900 font-black flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" /> {inspectedDriver.rating}</span>
                </div>
                <p className="text-[10px] font-bold text-purple-700">
                  {inspectedDriver.employer} <span className="text-zinc-400 font-normal">(@{inspectedDriver.employer_domain})</span>
                </p>
                <p className="text-[9px] text-zinc-500">
                  {inspectedDriver.vehicle.make} {inspectedDriver.vehicle.model} ({inspectedDriver.vehicle.plate_number})
                </p>
              </div>
            </div>
            <button
              onClick={() => setInspectedDriver(null)}
              className="w-6 h-6 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center font-bold text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 my-2.5">
            <div className="bg-purple-50/70 p-1.5 rounded-xl border border-purple-100 text-center">
              <span className="text-[8px] text-purple-600 block font-bold">Fuel Split</span>
              <span className="text-xs font-black text-purple-900">
                ₦{inspectedDriver.corridor.fuel_split_ngn.toLocaleString()}
              </span>
            </div>
            <div className="bg-emerald-50/70 p-1.5 rounded-xl border border-emerald-100 text-center">
              <span className="text-[8px] text-emerald-600 block font-bold">Seats Left</span>
              <span className="text-xs font-black text-emerald-800">
                {inspectedDriver.corridor.available_seats} of 3
              </span>
            </div>
            <div className="bg-amber-50/70 p-1.5 rounded-xl border border-amber-100 text-center">
              <span className="text-[8px] text-amber-600 block font-bold">Departure</span>
              <span className="text-xs font-black text-amber-900">
                {inspectedDriver.corridor.departure_time}
              </span>
            </div>
          </div>

          <button
            onClick={() => selectDriverById(inspectedDriver.id)}
            className="w-full py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#5B21B6] active:scale-98 text-white font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-[#7C3AED]/25 transition-all"
          >
            <Car className="w-4 h-4 text-amber-300" />
            <span>Request Commute Seat (₦{inspectedDriver.corridor.fuel_split_ngn.toLocaleString()})</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      )}

      {/* Floating Bottom Card: Inspected Traffic Hazard */}
      {inspectedAlert && (
        <div className="absolute bottom-20 left-2 right-2 z-[500] bg-white rounded-3xl p-3.5 shadow-2xl border border-red-200 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between gap-2 border-b border-red-100 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-black text-red-600 tracking-wider">
                  Live Traffic Hazard Warning
                </span>
                <h4 className="text-xs font-black text-zinc-900">{inspectedAlert.location}</h4>
              </div>
            </div>
            <button
              onClick={() => setInspectedAlert(null)}
              className="w-6 h-6 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center font-bold text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-zinc-700 font-medium my-2.5 leading-relaxed bg-red-50 p-2 rounded-xl border border-red-100">
            {inspectedAlert.message}
          </p>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
            <span className="font-bold">Estimated Delay: <strong className="text-red-600 font-black">+{inspectedAlert.delayMinutes} mins</strong></span>
            <span className="text-emerald-700 font-bold">Suggested Alternate: Marwa / Lekki Phase 1 bypass</span>
          </div>
        </div>
      )}
    </div>
  );
};
