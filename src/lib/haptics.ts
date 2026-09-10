// CAR PULL: Mobile Haptics & Vibration Engine
// Provides sensory feedback for native-like touch, swipe detents, matches, and alerts.

export type HapticPattern =
  | 'tick'      // 12ms detent notch for swipe threshold
  | 'tap'       // 8ms micro button press
  | 'switch'    // 15ms toggle switch
  | 'match'     // [25, 50, 45] double pulse for mutual match & escrow hold
  | 'success'   // [20, 40, 30] success confirmation
  | 'sos'       // [30, 50, 40, 40, 60, 30, 90] escalating rumble for emergency hold
  | 'warning'   // [40, 40, 40]
  | 'error';    // [40, 30, 40]

export const triggerHaptic = (pattern: HapticPattern = 'tap') => {
  if (typeof window === 'undefined') return;

  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      switch (pattern) {
        case 'tick':
          navigator.vibrate(12);
          break;
        case 'tap':
          navigator.vibrate(8);
          break;
        case 'switch':
          navigator.vibrate(15);
          break;
        case 'match':
          navigator.vibrate([25, 50, 45]);
          break;
        case 'success':
          navigator.vibrate([20, 40, 30]);
          break;
        case 'sos':
          navigator.vibrate([30, 50, 40, 40, 60, 30, 90]);
          break;
        case 'warning':
          navigator.vibrate([40, 40, 40]);
          break;
        case 'error':
          navigator.vibrate([40, 30, 40]);
          break;
      }
    } catch {
      // Silently fall back if the device or browser restricts vibrations
    }
  }
};
