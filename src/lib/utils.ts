// CAR PULL: Core Calculation & Compliance Utilities
// Location: /src/lib/utils.ts

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { EmergencyProvider, IncidentType, Vehicle } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ----------------------------------------------------------------------------
// PRICING FORMULA & STATUTORY ZERO-PROFIT CEILING ENGINE (Lagos State Transport Exemption)
// ----------------------------------------------------------------------------

export const MARKET_PMS_PRICE_PER_LITER = 1050; // Nigerian Naira per liter
export const SEDAN_FUEL_BURN_L_PER_KM = 0.10;   // 10 km per liter baseline
export const LEKKI_TOLL_FEE_NGN = 500;          // Lekki-Ikoyi Link / Expressway toll
export const AC_SURCHARGE_DEFAULT_NGN = 500;    // Stationary traffic heavy compressor fee

export interface PricingBreakdown {
  distanceKm: number;
  fuelCostNgn: number;
  tollFeeNgn: number;
  acSurchargeNgn: number;
  seats: number;
  fairShareCostNgn: number;
  maxLegalCeilingNgn: number;
  isLegal: boolean;
}

/**
 * Calculates fair-share fuel/toll split according to statutory formula:
 * TripCost = ((Distance * FuelBurn * PMSPrice) / Seats) + (Tolls / Seats) + ACSurcharge
 * Hard Ceiling = 1.2 * ((Distance * FuelBurn * PMSPrice) / Seats + Tolls / Seats) + ACSurcharge
 */
export function calculateTripCost(
  distanceKm: number,
  occupiedSeats: number = 3,
  includeAc: boolean = true,
  customBidNgn?: number
): PricingBreakdown {
  const safeSeats = Math.max(1, occupiedSeats);
  const totalFuelCost = distanceKm * SEDAN_FUEL_BURN_L_PER_KM * MARKET_PMS_PRICE_PER_LITER;
  const fuelCostPerSeat = Math.round(totalFuelCost / safeSeats);
  const tollFeePerSeat = Math.round(LEKKI_TOLL_FEE_NGN / safeSeats);
  const acFee = includeAc ? AC_SURCHARGE_DEFAULT_NGN : 0;

  const fairShareCostNgn = fuelCostPerSeat + tollFeePerSeat + acFee;
  // Programmatic statutory cap: max 1.2x of fuel and toll cost share + AC
  const maxLegalCeilingNgn = Math.round(1.2 * (fuelCostPerSeat + tollFeePerSeat) + acFee);

  const testAmount = customBidNgn !== undefined ? customBidNgn : fairShareCostNgn;
  const isLegal = testAmount <= maxLegalCeilingNgn;

  return {
    distanceKm,
    fuelCostNgn: fuelCostPerSeat,
    tollFeeNgn: tollFeePerSeat,
    acSurchargeNgn: acFee,
    seats: safeSeats,
    fairShareCostNgn,
    maxLegalCeilingNgn,
    isLegal,
  };
}

/**
 * Format currency into Nigerian Naira (₦)
 */
export function formatNgn(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount).replace('NGN', '₦');
}

// ----------------------------------------------------------------------------
// ROADSIDE RESILIENCE: TWO-PHASE DISPATCH ENGINE
// ----------------------------------------------------------------------------

/**
 * Phase 1: Hard Compatibility Filter
 * - AWD or 4WD vehicles CANNOT be towed on wheel-lift hooks without destroying differential
 * - Motorbike mechanics strictly for roadside repairs, not towing
 * - Diagnostic tools required for engine overheating
 * - Driver must have active LASDRI card for commercial operations
 */
export function passesPhase1Filter(
  vehicle: Partial<Vehicle>,
  provider: EmergencyProvider,
  incident: IncidentType
): { compatible: boolean; reason?: string } {
  // AWD or 4WD vehicles CANNOT be towed on wheel-lift hooks
  if (
    (vehicle.drivetrain === 'AWD' || vehicle.drivetrain === '4WD') &&
    incident === 'total_mechanical_tow'
  ) {
    if (provider.category !== 'flatbed_tow') {
      return {
        compatible: false,
        reason: 'AWD/4WD vehicles strictly require a Flatbed Tow to protect differential gearbox.',
      };
    }
  }

  // Motorbike mechanics cannot tow
  if (incident === 'total_mechanical_tow' && provider.category === 'mechanic_bike') {
    return {
      compatible: false,
      reason: 'Motorbike mechanics provide rapid roadside repairs only, not vehicle recovery.',
    };
  }

  // Diagnostic tools required for engine overheating
  if (incident === 'engine_overheating' && !provider.has_obd2_scanner) {
    return {
      compatible: false,
      reason: 'Engine thermal diagnosis requires calibrated OBD2 telemetry equipment.',
    };
  }

  // Driver must have active LASDRI card
  if (provider.has_lasdri_verified === false) {
    return {
      compatible: false,
      reason: 'Provider lacks Lagos State Drivers Institute (LASDRI) accreditation.',
    };
  }

  return { compatible: true };
}

/**
 * Phase 2: Dynamic Scoring Formula
 * FinalScore = 0.50 * ETA_traffic + 0.20 * Pen_uturn + 0.15 * (10 - Score_provider) + 0.15 * Mult_hazard
 * Lower score indicates highest dispatch priority.
 */
export function calculateProviderDispatchScore(
  provider: EmergencyProvider,
  isOpposingCarriageway: boolean = false,
  isHazardBlackspot: boolean = true
): { score: number; penUturn: number; multHazard: number } {
  const etaTraffic = provider.traffic_eta_minutes;
  // If provider is on opposite carriageway and must drive >2km to reverse direction: Pen_uturn = 20; else 0
  const penUturn = isOpposingCarriageway && provider.distance_km > 2.0 ? 20 : 0;
  // Normalized score out of 10
  const normalizedRating = (provider.rating / 5) * 10;
  // Roadway Hazard Multiplier: 15 on expressway shoulder / LASTMA blackspot
  const multHazard = isHazardBlackspot ? 15 : 0;

  const score = Number(
    (
      0.50 * etaTraffic +
      0.20 * penUturn +
      0.15 * (10 - normalizedRating) +
      0.15 * multHazard
    ).toFixed(2)
  );

  return { score, penUturn, multHazard };
}
