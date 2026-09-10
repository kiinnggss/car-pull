// CAR PULL: Type Definitions & Domain Interfaces

export type UserRole = 'commuter_rider' | 'commuter_driver' | 'mechanic' | 'tow_operator';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type GenderType = 'male' | 'female' | 'undisclosed';
export type DrivetrainType = 'FWD' | 'RWD' | 'AWD' | '4WD';
export type VehicleCategory = 'sedan' | 'suv' | 'van' | 'flatbed_tow' | 'wheel_lift_tow' | 'mechanic_bike';
export type SafeZoneType = 'fuel_station' | 'shopping_mall' | 'gated_estate_gate' | 'bank_premises';
export type MatchStatus = 'swiped_right' | 'counter_offered' | 'locked' | 'cancelled' | 'in_transit' | 'completed';
export type IncidentType = 'flat_tyre' | 'dead_battery' | 'engine_overheating' | 'total_mechanical_tow';
export type IncidentStatus = 'beacon_fired' | 'bidding_open' | 'operator_assigned' | 'en_route' | 'on_site' | 'resolved' | 'cancelled';

export interface User {
  id: string;
  phoneNumber: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  gender: GenderType;
  bvnHash: string;
  ninHash: string;
  kycStatus: VerificationStatus;
  isFemaleCommuteOnly: boolean;
  employer?: string;
  employerDomain?: string;
  alumniTag?: string;
  communityEstateName?: string;
  saasSubscriptionActive: boolean;
  ratingScore: number;
  tripsCompleted: number;
  escrowBalanceNgn: number;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  category: VehicleCategory;
  drivetrain: DrivetrainType;
  hasActiveAc: boolean;
  lacvisCertUrl?: string;
  lasdriCardUrl?: string;
  verifiedByAdmin: boolean;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LagosLocation {
  id: string;
  name: string;
  area: string;
  coordinates: Coordinates;
  nearestSafeZoneId?: string;
  isPopularPickup?: boolean;
  isPopularDropoff?: boolean;
}

export interface CommuteRoute {
  origin: string;
  originCoords: Coordinates;
  destination: string;
  destinationCoords: Coordinates;
  distanceKm: number;
  estimatedMinutes: number;
  recommendedFuelSplitNgn: number;
}

export interface SafeZone {
  id: string;
  name: string;
  zone_type: SafeZoneType;
  address: string;
  coordinates: Coordinates;
  is_active?: boolean;
}

export type TripCategory = 'all' | 'leaving_now' | 'morning' | 'evening' | 'flexible' | 'commute';

export type RideMood = 'chat' | 'easy' | 'quiet';

export interface CabinPassenger {
  id: string;
  name: string;
  role: string;
  avatar: string;
  seatNumber: number;
}

export interface CorridorDriver {
  id: string;
  name: string;
  avatar: string;
  employer: string;
  employer_domain: string;
  alumni: string;
  rating: number;
  trips_completed: number;
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
    plate_number: string;
    category: VehicleCategory;
    drivetrain: DrivetrainType;
    has_ac: boolean;
  };
  corridor: {
    origin: string;
    destination: string;
    departure_time: string;
    available_seats: number;
    fuel_split_ngn: number;
    ac_included: boolean;
    distance_km?: number;
  };
  vibe_tags: string[];
  trip_type?: TripCategory;
  trip_purpose?: string;
  conversation_vibe?: string;
  ride_mood?: RideMood;
  mutual_spark?: string;
  talk_about?: string[];
  cabin_passengers?: CabinPassenger[];
  interests?: string[];
  music_vibe?: string;
  social_handle?: string;
  linkedin_handle?: string;
}

export interface EmergencyProvider {
  id: string;
  name: string;
  operator_name: string;
  operator_photo: string;
  phone: string;
  category: VehicleCategory;
  rating: number;
  lasdri_id: string;
  plate_number: string;
  truck_type: string;
  distance_km: number;
  traffic_eta_minutes: number;
  flat_quote_ngn: number;
  equipment: string[];
  has_lasdri_verified?: boolean;
  has_obd2_scanner?: boolean;
  vehicle?: {
    category: VehicleCategory;
  };
}

export interface CommuteMatch {
  id: string;
  corridorId: string;
  driverId: string;
  riderId: string;
  driverName: string;
  riderName: string;
  driverAvatar: string;
  vehicleMake?: string;
  vehicleModel?: string;
  plateNumber?: string;
  fareNgn: number;
  hasAc: boolean;
  pickupSafeZone: SafeZone;
  status: MatchStatus;
  scheduledFor: string;
  isWeeklyLocked?: boolean;
  trip_type?: TripCategory;
  trip_purpose?: string;
  conversation_vibe?: string;
  ride_mood?: RideMood;
  mutual_spark?: string;
  talk_about?: string[];
  cabin_passengers?: CabinPassenger[];
  interests?: string[];
  linkedin_handle?: string;
}

export interface EmergencyIncident {
  id: string;
  commuterId: string;
  incidentType: IncidentType;
  locationDescription: string;
  coordinates: Coordinates;
  assignedProvider?: EmergencyProvider;
  escrowAmountNgn: number;
  escrowHeld: boolean;
  escrowReleased: boolean;
  status: IncidentStatus;
  dispatchAuthCode: string;
  assistanceShieldActive: boolean;
  countdownSeconds: number;
}

export interface WaitingRider {
  id: string;
  name: string;
  avatar: string;
  employer: string;
  employer_domain: string;
  rating: number;
  pickupSafeZone: SafeZone;
  destination: string;
  departure_time: string;
  bidNgn: number;
  isFemaleOnly: boolean;
  notes?: string;
  status: 'waiting' | 'accepted';
  trip_type?: TripCategory;
  trip_purpose?: string;
  conversation_vibe?: string;
  ride_mood?: RideMood;
  mutual_spark?: string;
  talk_about?: string[];
  interests?: string[];
  social_handle?: string;
  linkedin_handle?: string;
}

export interface TrafficAlert {
  id: string;
  location: string;
  status: 'free_flow' | 'moderate' | 'heavy' | 'flood_warning';
  delayMinutes: number;
  message: string;
}
