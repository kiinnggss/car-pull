// Live corridor polyline interpolation, ticking ETA helpers, and WhatsApp trip sharing.

export type LatLngTuple = [number, number];

export interface WhatsAppTripShareInput {
  driverName: string;
  plateNumber: string;
  pickupHub: string;
  boardingPin: string;
  vehicleModel?: string;
  scheduledFor?: string;
  etaLabel?: string;
  corridorLabel?: string;
}

/**
 * Interpolate a coordinate along a polyline for a progress fraction in [0, 1].
 */
export function interpolateAlongPolyline(
  path: LatLngTuple[],
  progress: number
): LatLngTuple {
  if (!path || path.length === 0) {
    return [6.448, 3.472];
  }
  if (path.length === 1) {
    return path[0];
  }

  const clamped = Math.max(0, Math.min(1, progress));
  if (clamped === 0) return path[0];
  if (clamped === 1) return path[path.length - 1];

  const segmentLengths: number[] = [];
  let totalLength = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const dLat = path[i + 1][0] - path[i][0];
    const dLng = path[i + 1][1] - path[i][1];
    const len = Math.hypot(dLat, dLng);
    segmentLengths.push(len);
    totalLength += len;
  }

  if (totalLength === 0) {
    return path[0];
  }

  const targetDist = clamped * totalLength;
  let traversed = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const segLen = segmentLengths[i];
    if (traversed + segLen >= targetDist && segLen > 0) {
      const localT = (targetDist - traversed) / segLen;
      const start = path[i];
      const end = path[i + 1];
      return [
        start[0] + (end[0] - start[0]) * localT,
        start[1] + (end[1] - start[1]) * localT,
      ];
    }
    traversed += segLen;
  }

  return path[path.length - 1];
}

/**
 * Compute remaining ETA minutes from a base estimate and current progress in [0, 1].
 */
export function estimateEtaMinutes(baseMinutes: number, progress: number): number {
  const clamped = Math.max(0, Math.min(1, progress));
  const remaining = Math.round(baseMinutes * (1 - clamped));
  return Math.max(0, remaining);
}

/**
 * Format an ETA minute count into a concise badge string.
 */
export function formatEtaLabel(minutes: number): string {
  if (minutes <= 1) {
    return 'Arriving now';
  }
  return `~${minutes} min away`;
}

/**
 * Parse a rough base ETA in minutes from strings like "Leaving in 5 mins", "07:15 AM", or walk minutes.
 */
export function parseBaseEtaMinutes(departureTime: string, fallbackMinutes: number = 9): number {
  const match = departureTime.match(/(\d+)\s*min/i);
  if (match) {
    const parsed = parseInt(match[1], 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return Math.max(3, parsed);
    }
  }
  return fallbackMinutes;
}

/**
 * Build a structured Lagos commuter safety manifest for WhatsApp sharing.
 */
export function buildWhatsAppTripShareText(input: WhatsAppTripShareInput): string {
  const lines = [
    '*CAR PULL - LIVE TRIP SHARE*',
    `• Driver: ${input.driverName}`,
    `• Plate: *${input.plateNumber}*`,
    ...(input.vehicleModel ? [`• Vehicle: ${input.vehicleModel}`] : []),
    `• Pickup Hub: ${input.pickupHub}`,
    ...(input.corridorLabel ? [`• Corridor: ${input.corridorLabel}`] : []),
    ...(input.scheduledFor ? [`• Departure: ${input.scheduledFor}`] : []),
    ...(input.etaLabel ? [`• Live ETA: ${input.etaLabel}`] : []),
    `• Boarding PIN: *${input.boardingPin}*`,
    '• Protected under Lagos Sec 44 Non-Commercial Carpool',
  ];
  return lines.join('\n');
}

/**
 * Copy the live trip manifest to the clipboard (when available) and open WhatsApp with the prefilled text.
 */
export function openWhatsAppTripShare(input: WhatsAppTripShareInput): {
  text: string;
  url: string;
  copied: boolean;
} {
  const text = buildWhatsAppTripShareText(input);
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  let copied = false;

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
    copied = true;
  }

  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return { text, url, copied };
}
