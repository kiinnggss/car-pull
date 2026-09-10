// CAR PULL: Application State Store (Zustand)
// Location: /src/lib/store/useAppStore.ts

import { create } from 'zustand';
import {
  User,
  UserRole,
  CorridorDriver,
  EmergencyProvider,
  EmergencyIncident,
  IncidentType,
  SafeZone,
  CommuteMatch,
  WaitingRider,
  TrafficAlert,
  LagosLocation,
  CommuteRoute,
  Coordinates,
  TripCategory,
} from '../types';
import {
  mockCurrentUser,
  mockCorridorDrivers,
  mockEmergencyProviders,
  mockSafeZones,
  mockCorridorRiders,
  mockTrafficAlerts,
  mockLagosLocations,
  defaultCommuteRoute,
} from '../mockData';
import {
  calculateTripCost,
  passesPhase1Filter,
  calculateProviderDispatchScore,
  MARKET_PMS_PRICE_PER_LITER,
} from '../utils';

export interface EscrowTransaction {
  id: string;
  type: 'HOLD_CARPOOL' | 'RELEASE_CARPOOL' | 'HOLD_EMERGENCY' | 'RELEASE_EMERGENCY' | 'FLAKE_PENALTY' | 'TOPUP' | 'WITHDRAWAL';
  amountNgn: number;
  reference: string;
  description: string;
  timestamp: string;
  status: 'held' | 'released' | 'refunded';
}

interface AppState {
  // Authentication & Session
  isAuthenticated: boolean;
  login: (emailOrPhone?: string, role?: 'rider' | 'driver') => void;
  logout: () => void;
  registerRider: (data: { fullName: string; email: string; phone: string; employer: string }) => void;
  registerDriver: (data: {
    fullName: string;
    email: string;
    phone: string;
    employer: string;
    vehicle: {
      make: string;
      model: string;
      year: number;
      color: string;
      plate_number: string;
      total_seats: number;
      has_ac: boolean;
    };
  }) => void;

  // Current User & Profile
  user: User;
  activeRole: 'rider' | 'driver';
  setActiveRole: (role: 'rider' | 'driver') => void;
  updateUserKyc: (status: User['kycStatus']) => void;
  toggleFemaleOnly: () => void;

  // Rider Custom Route (Location & Destination)
  riderRoute: CommuteRoute;
  lagosLocations: LagosLocation[];
  setRiderOrigin: (origin: string, coords?: Coordinates) => void;
  setRiderDestination: (destination: string, coords?: Coordinates) => void;
  swapRiderRoute: () => void;

  // Carpool Corridor & Deck State
  activeTripMode: TripCategory;
  setActiveTripMode: (mode: TripCategory) => void;
  drivers: CorridorDriver[];
  activeDriverIndex: number;
  currentDriver: CorridorDriver | null;
  selectedSafeZone: SafeZone;
  setSelectedSafeZone: (safeZone: SafeZone) => void;
  safeZones: SafeZone[];

  // Quick Bid & Pricing State
  customBidNgn: number;
  setCustomBidNgn: (amount: number) => void;
  adjustBid: (deltaNgn: number) => void;
  resetBidToFairShare: () => void;

  // Swipe Deck Actions
  swipeLeft: () => void;
  swipeRight: () => void;
  resetDeck: () => void;

  // Active Matches & Commute Lock
  activeMatches: CommuteMatch[];
  weeklyLockedCommutes: string[]; // driver IDs
  lockWeeklyCommute: (driverId: string) => void;
  unlockWeeklyCommute: (driverId: string) => void;

  // Emergency SOS & Roadside Dispatch State
  isSosActive: boolean;
  activeIncident: EmergencyIncident | null;
  selectedIssueType: IncidentType | null;
  candidateProviders: (EmergencyProvider & {
    score: number;
    compatible: boolean;
    incompatibilityReason?: string;
  })[];
  selectedProvider: EmergencyProvider | null;
  isAssistanceShieldVisible: boolean;
  sosCountdownSeconds: number;

  // Emergency Actions
  triggerSosBeacon: () => void;
  selectIncidentIssue: (issue: IncidentType) => void;
  acceptProviderBid: (provider: EmergencyProvider) => void;
  cancelEmergency: () => void;
  decrementSosCountdown: () => void;
  setShieldVisibility: (visible: boolean) => void;

  // Escrow & Wallet Management
  escrowBalanceNgn: number;
  heldEscrowNgn: number;
  escrowTransactions: EscrowTransaction[];
  releaseEscrow: (reference: string) => void;
  simulateFlakePenalty: (type: 'rider_flake' | 'driver_flake') => void;
  topUpWallet: (amountNgn: number) => void;
  withdrawFunds: (amountNgn: number, bankName: string, accountNumber: string, accountName: string) => boolean;

  // Corridor Direction & Traffic State
  commuteDirection: 'morning' | 'evening';
  setCommuteDirection: (dir: 'morning' | 'evening') => void;
  toggleCommuteDirection: () => void;
  trafficAlerts: TrafficAlert[];

  // Driver Carpool Management
  driverVehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
    plate_number: string;
    total_seats: number;
  };
  updateDriverCar: (car: {
    make: string;
    model: string;
    year: number;
    color: string;
    plate_number: string;
    total_seats: number;
  }) => void;
  availableSeats: number;
  corridorRiders: WaitingRider[];
  acceptedRiders: WaitingRider[];
  acceptRiderIntoCarpool: (riderId: string) => void;
  removeRiderFromCarpool: (riderId: string) => void;

  // Offline Verification
  offlinePin: string;

  // Fastest Flatbed Action
  dispatchFastestFlatbed: () => void;

  // Corridor Driver Selection
  selectDriverById: (driverId: string) => void;

  // UI Navigation
  activeTab: 'deck' | 'map' | 'matches' | 'pass' | 'safezones' | 'sos' | 'wallet';
  setActiveTab: (tab: 'deck' | 'map' | 'matches' | 'pass' | 'safezones' | 'sos' | 'wallet') => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Authentication & Session
  isAuthenticated: false,
  login: (emailOrPhone, role) => {
    if (role) {
      set({ isAuthenticated: true, activeRole: role });
    } else {
      set({ isAuthenticated: true });
    }
  },
  logout: () => {
    set({ isAuthenticated: false, activeTab: 'deck' });
  },
  registerRider: (data) => {
    set((state) => ({
      isAuthenticated: true,
      activeRole: 'rider',
      user: {
        ...state.user,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phone,
        employer: data.employer || 'Corporate Executive',
        employerDomain: data.email.includes('@') ? data.email.split('@')[1] : 'corp.ng',
      },
    }));
  },
  registerDriver: (data) => {
    const newDriverProfile: CorridorDriver = {
      id: `driver-custom-${Date.now()}`,
      name: data.fullName,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      employer: data.employer || 'Corporate Professional',
      employer_domain: data.email.includes('@') ? data.email.split('@')[1] : 'corp.ng',
      alumni: 'Lagos Professional Network',
      rating: 5.0,
      trips_completed: 1,
      vehicle: {
        make: data.vehicle.make,
        model: data.vehicle.model,
        year: data.vehicle.year,
        color: data.vehicle.color,
        plate_number: data.vehicle.plate_number,
        category: 'sedan',
        drivetrain: 'FWD',
        has_ac: data.vehicle.has_ac,
      },
      corridor: {
        origin: 'Ajah Jubilee Bridge / Langbasa',
        destination: 'Victoria Island (Adeola Odeku)',
        departure_time: '07:00 AM',
        available_seats: data.vehicle.total_seats,
        fuel_split_ngn: 2000,
        ac_included: data.vehicle.has_ac,
      },
      vibe_tags: ['AC On', 'Quiet Commute', 'Executive'],
    };

    set((state) => ({
      isAuthenticated: true,
      activeRole: 'driver',
      activeTab: 'deck',
      user: {
        ...state.user,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phone,
        employer: data.employer || 'Corporate Executive',
        employerDomain: data.email.includes('@') ? data.email.split('@')[1] : 'corp.ng',
      },
      driverVehicle: {
        make: data.vehicle.make,
        model: data.vehicle.model,
        year: data.vehicle.year,
        color: data.vehicle.color,
        plate_number: data.vehicle.plate_number,
        total_seats: data.vehicle.total_seats,
      },
      availableSeats: data.vehicle.total_seats,
      drivers: [newDriverProfile, ...state.drivers],
    }));
  },

  user: mockCurrentUser,
  activeRole: 'rider',
  setActiveRole: (role) => set({ activeRole: role }),
  updateUserKyc: (status) =>
    set((state) => ({ user: { ...state.user, kycStatus: status } })),
  toggleFemaleOnly: () =>
    set((state) => ({
      user: { ...state.user, isFemaleCommuteOnly: !state.user.isFemaleCommuteOnly },
    })),

  riderRoute: defaultCommuteRoute,
  lagosLocations: mockLagosLocations,

  setRiderOrigin: (origin: string, coords?: Coordinates) => {
    const loc = get().lagosLocations.find(
      (l) => l.name.toLowerCase().includes(origin.toLowerCase()) || origin.toLowerCase().includes(l.name.toLowerCase())
    );
    const defaultCoords = coords || loc?.coordinates || { lat: 6.4678, lng: 3.5683 };
    const currentDest = get().riderRoute.destinationCoords;

    const dLat = (currentDest.lat - defaultCoords.lat) * 111;
    const dLng = (currentDest.lng - defaultCoords.lng) * 111 * Math.cos(defaultCoords.lat * (Math.PI / 180));
    const distKm = Math.max(4, Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 1.3 * 10) / 10);
    const estMinutes = Math.round(distKm * 1.8);
    const fairSplit = Math.round((distKm * 65 + 400) / 50) * 50;

    const safeZones = get().safeZones;
    let nearestZone = safeZones[0];
    let minDistance = Infinity;
    safeZones.forEach((sz) => {
      const dist = Math.hypot(sz.coordinates.lat - defaultCoords.lat, sz.coordinates.lng - defaultCoords.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestZone = sz;
      }
    });

    set((state) => ({
      selectedSafeZone: nearestZone,
      customBidNgn: fairSplit,
      riderRoute: {
        ...state.riderRoute,
        origin,
        originCoords: defaultCoords,
        distanceKm: distKm,
        estimatedMinutes: estMinutes,
        recommendedFuelSplitNgn: fairSplit,
      },
    }));
  },

  setRiderDestination: (destination: string, coords?: Coordinates) => {
    const loc = get().lagosLocations.find(
      (l) => l.name.toLowerCase().includes(destination.toLowerCase()) || destination.toLowerCase().includes(l.name.toLowerCase())
    );
    const defaultCoords = coords || loc?.coordinates || { lat: 6.4350, lng: 3.4280 };
    const currentOrigin = get().riderRoute.originCoords;

    const dLat = (defaultCoords.lat - currentOrigin.lat) * 111;
    const dLng = (defaultCoords.lng - currentOrigin.lng) * 111 * Math.cos(currentOrigin.lat * (Math.PI / 180));
    const distKm = Math.max(4, Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 1.3 * 10) / 10);
    const estMinutes = Math.round(distKm * 1.8);
    const fairSplit = Math.round((distKm * 65 + 400) / 50) * 50;

    set((state) => ({
      customBidNgn: fairSplit,
      riderRoute: {
        ...state.riderRoute,
        destination,
        destinationCoords: defaultCoords,
        distanceKm: distKm,
        estimatedMinutes: estMinutes,
        recommendedFuelSplitNgn: fairSplit,
      },
    }));
  },

  swapRiderRoute: () => {
    const current = get().riderRoute;
    const newOrigin = current.destination;
    const newOriginCoords = current.destinationCoords;
    const newDest = current.origin;
    const newDestCoords = current.originCoords;

    const safeZones = get().safeZones;
    let nearestZone = safeZones[0];
    let minDistance = Infinity;
    safeZones.forEach((sz) => {
      const dist = Math.hypot(sz.coordinates.lat - newOriginCoords.lat, sz.coordinates.lng - newOriginCoords.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestZone = sz;
      }
    });

    set((state) => ({
      commuteDirection: state.commuteDirection === 'morning' ? 'evening' : 'morning',
      selectedSafeZone: nearestZone,
      riderRoute: {
        ...state.riderRoute,
        origin: newOrigin,
        originCoords: newOriginCoords,
        destination: newDest,
        destinationCoords: newDestCoords,
      },
    }));
  },

  activeTripMode: 'all',
  setActiveTripMode: (mode: TripCategory) => {
    let filtered = mockCorridorDrivers;
    if (mode !== 'all') {
      filtered = mockCorridorDrivers.filter((d) => d.trip_type === mode);
      if (filtered.length === 0) filtered = mockCorridorDrivers;
    }
    set({
      activeTripMode: mode,
      drivers: filtered,
      activeDriverIndex: 0,
      currentDriver: filtered[0] || null,
      customBidNgn: filtered[0]?.corridor.fuel_split_ngn || 1500,
    });
  },

  drivers: mockCorridorDrivers,
  activeDriverIndex: 0,
  currentDriver: mockCorridorDrivers[0] || null,
  selectedSafeZone: mockSafeZones[0],
  setSelectedSafeZone: (safeZone) => set({ selectedSafeZone: safeZone }),
  safeZones: mockSafeZones,

  customBidNgn: mockCorridorDrivers[0]?.corridor.fuel_split_ngn || 1500,
  setCustomBidNgn: (amount) => set({ customBidNgn: amount }),
  adjustBid: (deltaNgn) =>
    set((state) => {
      const newAmount = Math.max(500, state.customBidNgn + deltaNgn);
      return { customBidNgn: newAmount };
    }),
  resetBidToFairShare: () =>
    set((state) => {
      const driver = state.drivers[state.activeDriverIndex];
      return { customBidNgn: driver?.corridor.fuel_split_ngn || 1500 };
    }),

  swipeLeft: () => {
    set((state) => {
      const nextIndex = state.activeDriverIndex + 1;
      const nextDriver = nextIndex < state.drivers.length ? state.drivers[nextIndex] : null;
      return {
        activeDriverIndex: nextIndex,
        currentDriver: nextDriver,
        customBidNgn: nextDriver?.corridor.fuel_split_ngn || 2000,
      };
    });
  },

  swipeRight: () => {
    const state = get();
    const currentDriver = state.drivers[state.activeDriverIndex];
    if (!currentDriver) return;

    const agreedFare = state.customBidNgn;
    const escrowRef = `ESC-CP-${Date.now().toString().slice(-6)}`;

    // Create match and place escrow hold with rich social connection details
    const newMatch: CommuteMatch = {
      id: `match-${Date.now()}`,
      corridorId: 'corridor-ajah-vi-01',
      driverId: currentDriver.id,
      riderId: state.user.id,
      driverName: currentDriver.name,
      riderName: state.user.fullName,
      driverAvatar: currentDriver.avatar,
      vehicleMake: currentDriver.vehicle.make,
      vehicleModel: currentDriver.vehicle.model,
      plateNumber: currentDriver.vehicle.plate_number,
      fareNgn: agreedFare,
      hasAc: true,
      pickupSafeZone: state.selectedSafeZone,
      status: 'locked',
      scheduledFor: currentDriver.corridor.departure_time,
      trip_type: currentDriver.trip_type || 'morning',
      trip_purpose: currentDriver.trip_purpose || 'Everyday Lagos Commute',
      conversation_vibe: currentDriver.conversation_vibe || 'Great Banter',
      ride_mood: currentDriver.ride_mood || 'chat',
      mutual_spark: currentDriver.mutual_spark,
      talk_about: currentDriver.talk_about || ['#Tech', '#Lagos'],
      cabin_passengers: currentDriver.cabin_passengers,
      interests: currentDriver.interests || ['Afrobeats', 'Tech'],
      linkedin_handle: currentDriver.linkedin_handle,
    };

    const newTransaction: EscrowTransaction = {
      id: `tx-${Date.now()}`,
      type: 'HOLD_CARPOOL',
      amountNgn: agreedFare,
      reference: escrowRef,
      description: `Held for ${currentDriver.name} (${state.selectedSafeZone.name} -> VI)`,
      timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      status: 'held',
    };

    const nextIndex = state.activeDriverIndex + 1;
    const nextDriver = nextIndex < state.drivers.length ? state.drivers[nextIndex] : null;

    set({
      activeDriverIndex: nextIndex,
      currentDriver: nextDriver,
      customBidNgn: nextDriver?.corridor.fuel_split_ngn || 2000,
      activeMatches: [newMatch, ...state.activeMatches],
      escrowBalanceNgn: Math.max(0, state.escrowBalanceNgn - agreedFare),
      heldEscrowNgn: state.heldEscrowNgn + agreedFare,
      escrowTransactions: [newTransaction, ...state.escrowTransactions],
    });
  },

  resetDeck: () => {
    const mode = get().activeTripMode;
    let filtered = mockCorridorDrivers;
    if (mode !== 'all') {
      filtered = mockCorridorDrivers.filter((d) => d.trip_type === mode);
      if (filtered.length === 0) filtered = mockCorridorDrivers;
    }
    set({
      drivers: filtered,
      activeDriverIndex: 0,
      currentDriver: filtered[0] || null,
      customBidNgn: filtered[0]?.corridor.fuel_split_ngn || 1500,
    });
  },

  activeMatches: [
    {
      id: 'match-prev-02',
      corridorId: 'corridor-lekki-vi-02',
      driverId: 'driver-107',
      riderId: mockCurrentUser.id,
      driverName: 'Damilola Fashola',
      riderName: mockCurrentUser.fullName,
      driverAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
      vehicleMake: 'Mercedes-Benz',
      vehicleModel: 'GLA 250',
      plateNumber: 'LSR-210-DK',
      fareNgn: 1500,
      hasAc: true,
      pickupSafeZone: mockSafeZones[4],
      status: 'locked',
      scheduledFor: 'Today, 08:30 AM',
      trip_type: 'morning',
      trip_purpose: 'Heading to Victoria Island for design agency client review',
      conversation_vibe: 'Open to Chat & Brainstorm',
      ride_mood: 'chat',
      mutual_spark: 'Both in Tech & Design',
      talk_about: ['#BrandDesign', '#LagosStartups', '#Afrobeats'],
      cabin_passengers: [
        {
          id: 'p1',
          name: 'Tiwa Sowande',
          role: 'Design Lead',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          seatNumber: 1,
        },
      ],
      interests: ['Afrobeats', 'Design & Art', 'Startups', 'Coffee'],
      linkedin_handle: 'damilola-fashola',
    },
    {
      id: 'match-prev-01',
      corridorId: 'corridor-ajah-vi-01',
      driverId: 'driver-101',
      riderId: mockCurrentUser.id,
      driverName: 'Babatunde Adeleke',
      riderName: mockCurrentUser.fullName,
      driverAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      plateNumber: 'APP-842-EY',
      fareNgn: 1500,
      hasAc: true,
      pickupSafeZone: mockSafeZones[0],
      status: 'locked',
      scheduledFor: 'Monday, 07:15 AM',
      isWeeklyLocked: true,
      trip_type: 'morning',
      trip_purpose: 'Morning run to Flutterwave HQ for engineering sync',
      conversation_vibe: 'Light Banter & Good Music',
      ride_mood: 'easy',
      mutual_spark: 'FinTech & Engineering Circle',
      talk_about: ['#FinTech', '#SystemArchitecture', '#Formula1'],
      cabin_passengers: [
        {
          id: 'p2',
          name: 'Amara Nwosu',
          role: 'Architect',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
          seatNumber: 1,
        },
      ],
      interests: ['FinTech', 'Afrobeats', 'Formula 1', 'Startups'],
      linkedin_handle: 'babatunde-adeleke',
    },
  ],
  weeklyLockedCommutes: ['driver-101'],
  lockWeeklyCommute: (driverId) =>
    set((state) => ({
      weeklyLockedCommutes: state.weeklyLockedCommutes.includes(driverId)
        ? state.weeklyLockedCommutes
        : [...state.weeklyLockedCommutes, driverId],
      activeMatches: state.activeMatches.map((m) =>
        m.driverId === driverId ? { ...m, isWeeklyLocked: true } : m
      ),
    })),
  unlockWeeklyCommute: (driverId) =>
    set((state) => ({
      weeklyLockedCommutes: state.weeklyLockedCommutes.filter((id) => id !== driverId),
      activeMatches: state.activeMatches.map((m) =>
        m.driverId === driverId ? { ...m, isWeeklyLocked: false } : m
      ),
    })),

  // Emergency SOS Initial State
  isSosActive: false,
  activeIncident: null,
  selectedIssueType: null,
  candidateProviders: [],
  selectedProvider: null,
  isAssistanceShieldVisible: false,
  sosCountdownSeconds: 720, // 12 minutes default

  triggerSosBeacon: () => {
    set({
      isSosActive: true,
      selectedIssueType: null,
      selectedProvider: null,
      isAssistanceShieldVisible: false,
      activeTab: 'sos',
    });
  },

  selectIncidentIssue: (issue) => {
    // Current user's car drivetrain assumed FWD Sedan or AWD
    const mockUserVehicle = { drivetrain: 'AWD' as const, category: 'suv' as const };

    // Run Two-Phase Dispatch Scoring
    const scoredProviders = mockEmergencyProviders.map((prov) => {
      const phase1 = passesPhase1Filter(mockUserVehicle, prov, issue);
      const isOpposing = prov.distance_km > 3.0; // Simulated median barrier
      const { score } = calculateProviderDispatchScore(prov, isOpposing, true);

      return {
        ...prov,
        score,
        compatible: phase1.compatible,
        incompatibilityReason: phase1.reason,
      };
    }).sort((a, b) => {
      // Prioritize compatible first, then lowest score
      if (a.compatible && !b.compatible) return -1;
      if (!a.compatible && b.compatible) return 1;
      return a.score - b.score;
    });

    const incident: EmergencyIncident = {
      id: `INC-LAG-${Date.now().toString().slice(-5)}`,
      commuterId: get().user.id,
      incidentType: issue,
      locationDescription: 'Lekki-Epe Expressway, 200m before Chevron Toll Gate, Westbound',
      coordinates: { lat: 6.4428, lng: 3.5186 },
      escrowAmountNgn: 0,
      escrowHeld: false,
      escrowReleased: false,
      status: 'bidding_open',
      dispatchAuthCode: `LASG-EMG-${Math.floor(100000 + Math.random() * 900000)}`,
      assistanceShieldActive: false,
      countdownSeconds: 840,
    };

    set({
      selectedIssueType: issue,
      candidateProviders: scoredProviders,
      activeIncident: incident,
    });
  },

  acceptProviderBid: (provider) => {
    const state = get();
    if (!state.activeIncident) return;

    const escrowRef = `ESC-SOS-${Date.now().toString().slice(-6)}`;
    const cost = provider.flat_quote_ngn;

    const updatedIncident: EmergencyIncident = {
      ...state.activeIncident,
      assignedProvider: provider,
      escrowAmountNgn: cost,
      escrowHeld: true,
      status: 'en_route',
      assistanceShieldActive: true,
      countdownSeconds: provider.traffic_eta_minutes * 60,
    };

    const newTx: EscrowTransaction = {
      id: `tx-sos-${Date.now()}`,
      type: 'HOLD_EMERGENCY',
      amountNgn: cost,
      reference: escrowRef,
      description: `Emergency Escrow Hold: ${provider.name} (${provider.truck_type})`,
      timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      status: 'held',
    };

    set({
      selectedProvider: provider,
      activeIncident: updatedIncident,
      isAssistanceShieldVisible: true,
      sosCountdownSeconds: provider.traffic_eta_minutes * 60,
      escrowBalanceNgn: Math.max(0, state.escrowBalanceNgn - cost),
      heldEscrowNgn: state.heldEscrowNgn + cost,
      escrowTransactions: [newTx, ...state.escrowTransactions],
    });
  },

  cancelEmergency: () => {
    set({
      isSosActive: false,
      activeIncident: null,
      selectedIssueType: null,
      selectedProvider: null,
      isAssistanceShieldVisible: false,
      activeTab: 'deck',
    });
  },

  decrementSosCountdown: () => {
    set((state) => ({
      sosCountdownSeconds: Math.max(0, state.sosCountdownSeconds - 1),
    }));
  },

  setShieldVisibility: (visible) => set({ isAssistanceShieldVisible: visible }),

  // Escrow Wallet State
  escrowBalanceNgn: 45000,
  heldEscrowNgn: 2000,
  escrowTransactions: [
    {
      id: 'tx-seed-01',
      type: 'TOPUP',
      amountNgn: 50000,
      reference: 'PAYSTACK-TOPUP-9921',
      description: 'Bank Card Top-up (Paystack Auto-Fund)',
      timestamp: '08:15 AM',
      status: 'released',
    },
    {
      id: 'tx-seed-02',
      type: 'HOLD_CARPOOL',
      amountNgn: 2000,
      reference: 'ESC-CP-49102',
      description: 'Held for Babatunde Adeleke (Monday Commute)',
      timestamp: '09:30 AM',
      status: 'held',
    },
  ],

  releaseEscrow: (reference) => {
    set((state) => {
      const tx = state.escrowTransactions.find((t) => t.reference === reference);
      if (!tx || tx.status !== 'held') return state;

      return {
        heldEscrowNgn: Math.max(0, state.heldEscrowNgn - tx.amountNgn),
        escrowTransactions: state.escrowTransactions.map((t) =>
          t.reference === reference ? { ...t, status: 'released' as const } : t
        ),
      };
    });
  },

  simulateFlakePenalty: (type) => {
    const state = get();
    if (type === 'rider_flake') {
      // ₦1,000 cancellation fee debited
      const tx: EscrowTransaction = {
        id: `tx-flake-${Date.now()}`,
        type: 'FLAKE_PENALTY',
        amountNgn: 1000,
        reference: `FLAKE-RIDER-${Date.now().toString().slice(-4)}`,
        description: 'Late Cancellation Flake Penalty (Debited to Driver)',
        timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
        status: 'released',
      };
      set({
        escrowBalanceNgn: Math.max(0, state.escrowBalanceNgn - 1000),
        escrowTransactions: [tx, ...state.escrowTransactions],
      });
    } else {
      // Driver flaked - Rider receives ₦2,500 Uber/Bolt voucher credit
      const tx: EscrowTransaction = {
        id: `tx-flake-${Date.now()}`,
        type: 'FLAKE_PENALTY',
        amountNgn: 2500,
        reference: `UBER-BOLT-VOUCH-${Date.now().toString().slice(-4)}`,
        description: 'Driver Flake Relief: Instant ₦2,500 Uber/Bolt Code Credited',
        timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
        status: 'released',
      };
      set({
        escrowBalanceNgn: state.escrowBalanceNgn + 2500,
        escrowTransactions: [tx, ...state.escrowTransactions],
      });
    }
  },

  topUpWallet: (amountNgn) => {
    const tx: EscrowTransaction = {
      id: `tx-top-${Date.now()}`,
      type: 'TOPUP',
      amountNgn,
      reference: `PAYSTACK-${Date.now().toString().slice(-6)}`,
      description: 'Paystack Direct Bank Funding',
      timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      status: 'released',
    };
    set((state) => ({
      escrowBalanceNgn: state.escrowBalanceNgn + amountNgn,
      escrowTransactions: [tx, ...state.escrowTransactions],
    }));
  },

  withdrawFunds: (amountNgn, bankName, accountNumber, accountName) => {
    const state = get();
    if (amountNgn <= 0 || amountNgn > state.escrowBalanceNgn) return false;

    const tx: EscrowTransaction = {
      id: `tx-wth-${Date.now()}`,
      type: 'WITHDRAWAL',
      amountNgn,
      reference: `NIP-${Date.now().toString().slice(-6)}`,
      description: `NIBSS Instant Transfer to ${bankName} (${accountNumber}) - ${accountName}`,
      timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      status: 'released',
    };

    set({
      escrowBalanceNgn: state.escrowBalanceNgn - amountNgn,
      escrowTransactions: [tx, ...state.escrowTransactions],
    });
    return true;
  },

  // Corridor Direction & Traffic State
  commuteDirection: 'morning',
  setCommuteDirection: (dir) => set({ commuteDirection: dir }),
  toggleCommuteDirection: () =>
    set((state) => ({
      commuteDirection: state.commuteDirection === 'morning' ? 'evening' : 'morning',
      activeDriverIndex: 0,
      currentDriver: state.drivers[0] || null,
    })),
  trafficAlerts: mockTrafficAlerts,

  // Driver Carpool Management
  driverVehicle: {
    make: 'Toyota',
    model: 'Camry',
    year: 2021,
    color: 'Midnight Black',
    plate_number: 'APP-842-EY',
    total_seats: 3,
  },
  updateDriverCar: (car) => {
    set({
      driverVehicle: car,
      availableSeats: car.total_seats,
    });
  },
  availableSeats: 3,
  corridorRiders: mockCorridorRiders,
  acceptedRiders: [],
  acceptRiderIntoCarpool: (riderId) => {
    const state = get();
    if (state.availableSeats <= 0) return;
    const rider = state.corridorRiders.find((r) => r.id === riderId);
    if (!rider) return;

    const newAccepted = [...state.acceptedRiders, { ...rider, status: 'accepted' as const }];
    const newAvailable = state.availableSeats - 1;

    // Prorated fuel split based on riders in car
    const riderCount = newAccepted.length;
    const proratedFare = riderCount === 1 ? 2000 : riderCount === 2 ? 1400 : 1000;

    const newMatch: CommuteMatch = {
      id: `match-driver-${Date.now()}-${rider.id}`,
      corridorId: 'corridor-ajah-vi-01',
      driverId: state.user.id,
      riderId: rider.id,
      driverName: state.user.fullName,
      riderName: rider.name,
      driverAvatar: state.user.avatarUrl,
      vehicleMake: state.driverVehicle.make,
      vehicleModel: state.driverVehicle.model,
      plateNumber: state.driverVehicle.plate_number,
      fareNgn: proratedFare,
      hasAc: true,
      pickupSafeZone: rider.pickupSafeZone,
      status: 'locked',
      scheduledFor: `${state.commuteDirection === 'morning' ? 'Morning' : 'Evening'}, ${rider.departure_time}`,
    };

    const newTx: EscrowTransaction = {
      id: `tx-rider-hold-${Date.now()}`,
      type: 'HOLD_CARPOOL',
      amountNgn: proratedFare,
      reference: `ESC-RIDER-${Date.now().toString().slice(-5)}`,
      description: `Held from ${rider.name} (${rider.pickupSafeZone.name} -> VI)`,
      timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      status: 'held',
    };

    set({
      availableSeats: newAvailable,
      acceptedRiders: newAccepted,
      corridorRiders: state.corridorRiders.map((r) =>
        r.id === riderId ? { ...r, status: 'accepted' as const } : r
      ),
      activeMatches: [newMatch, ...state.activeMatches],
      escrowTransactions: [newTx, ...state.escrowTransactions],
      heldEscrowNgn: state.heldEscrowNgn + proratedFare,
    });
  },

  removeRiderFromCarpool: (riderId) => {
    const state = get();
    const rider = state.acceptedRiders.find((r) => r.id === riderId);
    if (!rider) return;

    const newAccepted = state.acceptedRiders.filter((r) => r.id !== riderId);
    set({
      availableSeats: Math.min(3, state.availableSeats + 1),
      acceptedRiders: newAccepted,
      corridorRiders: state.corridorRiders.map((r) =>
        r.id === riderId ? { ...r, status: 'waiting' as const } : r
      ),
      activeMatches: state.activeMatches.filter((m) => m.riderId !== riderId),
    });
  },

  // Offline Verification PIN
  offlinePin: '4892',

  // Fastest Flatbed Action
  dispatchFastestFlatbed: () => {
    const state = get();
    const flatbed = mockEmergencyProviders.find((p) => p.category === 'flatbed_tow') || mockEmergencyProviders[0];
    
    const incident: EmergencyIncident = {
      id: `inc-fast-${Date.now()}`,
      commuterId: state.user.id,
      incidentType: 'total_mechanical_tow',
      locationDescription: 'Lekki-Epe Expressway, near Jakande / Sandfill',
      coordinates: { lat: 6.4428, lng: 3.5186 },
      assignedProvider: flatbed,
      escrowAmountNgn: flatbed.flat_quote_ngn,
      escrowHeld: true,
      escrowReleased: false,
      status: 'en_route',
      dispatchAuthCode: `LASG-EMG-${Math.floor(100000 + Math.random() * 900000)}`,
      assistanceShieldActive: true,
      countdownSeconds: flatbed.traffic_eta_minutes * 60,
    };

    const newTx: EscrowTransaction = {
      id: `tx-sos-${Date.now()}`,
      type: 'HOLD_EMERGENCY',
      amountNgn: flatbed.flat_quote_ngn,
      reference: `ESC-SOS-${Date.now().toString().slice(-6)}`,
      description: `Fast Flatbed Dispatch: ${flatbed.name} (${flatbed.truck_type})`,
      timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      status: 'held',
    };

    set({
      isSosActive: true,
      selectedIssueType: 'total_mechanical_tow',
      selectedProvider: flatbed,
      activeIncident: incident,
      isAssistanceShieldVisible: true,
      sosCountdownSeconds: flatbed.traffic_eta_minutes * 60,
      escrowBalanceNgn: Math.max(0, state.escrowBalanceNgn - flatbed.flat_quote_ngn),
      heldEscrowNgn: state.heldEscrowNgn + flatbed.flat_quote_ngn,
      escrowTransactions: [newTx, ...state.escrowTransactions],
      activeTab: 'sos',
    });
  },

  selectDriverById: (driverId: string) => {
    const drivers = get().drivers;
    const idx = drivers.findIndex((d) => d.id === driverId);
    if (idx !== -1) {
      set({
        activeDriverIndex: idx,
        currentDriver: drivers[idx],
        customBidNgn: drivers[idx].corridor.fuel_split_ngn,
        activeTab: 'deck',
      });
    }
  },

  activeTab: 'deck',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
