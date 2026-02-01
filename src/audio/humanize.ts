/**
 * Humanization utilities for making playback less mechanical.
 * Adds subtle random variation to velocity and timing.
 */

/**
 * Humanize a velocity value by adding random variation.
 * @param baseVelocity - Base velocity (0-1)
 * @param amount - Humanization amount (0-1), where 0 = no variation
 * @returns Clamped velocity between 0.1 and 1.0
 */
export function humanizeVelocity(baseVelocity: number, amount: number): number {
  if (amount <= 0) return baseVelocity;
  const variation = (Math.random() - 0.5) * 2 * amount * 0.15;
  return Math.max(0.1, Math.min(1.0, baseVelocity + variation));
}

/**
 * Humanize a timing value by adding random offset.
 * @param baseTime - Base time in seconds
 * @param amount - Humanization amount (0-1)
 * @returns Time offset in seconds (always >= 0)
 */
export function humanizeTiming(baseTime: number, amount: number): number {
  if (amount <= 0) return baseTime;
  const maxOffset = 0.03 * amount; // up to 30ms at full humanization
  const offset = (Math.random() - 0.5) * 2 * maxOffset;
  return Math.max(0, baseTime + offset);
}

/**
 * Apply swing feel by delaying off-beat notes.
 * @param beatIndex - The beat index (0-based)
 * @param beatDuration - Duration of one beat in seconds
 * @param swingAmount - Swing amount (0-1), where 0 = straight, 1 = full triplet swing
 * @returns Time offset to add for swing feel
 */
export function applySwing(beatIndex: number, beatDuration: number, swingAmount: number): number {
  if (swingAmount <= 0) return 0;
  // Only swing off-beats (odd indices)
  if (beatIndex % 2 === 0) return 0;
  return beatDuration * 0.33 * swingAmount;
}
