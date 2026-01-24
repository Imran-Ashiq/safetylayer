'use client';

/**
 * Haptic Feedback Utility
 * 
 * Provides haptic feedback on supported mobile devices using the Vibration API.
 * Gracefully degrades on unsupported devices.
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning';

const hapticPatterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [25, 50, 25],
  error: [50, 100, 50, 100, 50],
  warning: [50, 50, 50],
};

/**
 * Trigger haptic feedback if supported
 * @param pattern - The type of haptic feedback
 */
export function haptic(pattern: HapticPattern = 'light'): void {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(hapticPatterns[pattern]);
    } catch {
      // Silently fail if vibration is not supported
    }
  }
}

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return typeof window !== 'undefined' && 'vibrate' in navigator;
}
