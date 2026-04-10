import { DEFAULT_EXPAND_DUR, DEFAULT_COLLAPSE_DUR } from '../constants'

/**
 * Squish spring config — scales mass with morph duration so feel stays consistent.
 * bounce 0.0 = heavily damped (subtle), 0.8 = very bouncy (dramatic)
 */
export function squishSpring(durationSec: number, defaultDur: number, bounce = 0.4) {
  const scale = durationSec / defaultDur
  // Map bounce (0-0.8) to stiffness (200-550) and damping (24-8)
  const stiffness = 200 + bounce * 437.5
  const damping = 24 - bounce * 20
  const mass = 0.7 * scale
  return { type: 'spring' as const, stiffness, damping, mass }
}

export function expandSpring(bounce = 0.4) {
  return squishSpring(DEFAULT_EXPAND_DUR, DEFAULT_EXPAND_DUR, bounce)
}

export function collapseSpring(bounce = 0.4) {
  return squishSpring(DEFAULT_COLLAPSE_DUR, DEFAULT_COLLAPSE_DUR, bounce)
}
