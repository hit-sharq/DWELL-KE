// Cinematic animation presets for Dwell KE
// Every preset uses physics-based spring motion — no cheap fade-ins.
// All scroll-based animations use isometric reveal with depth offset,
// and all hover interactions use realistic spring physics.

import type { Variants, Target, Transition } from 'framer-motion';

/* ─── SPRING PHYSICS ─── */
export const springSnappy = (
  stiffness = 360,
  damping   = 30,
): Transition => ({ type: 'spring', stiffness, damping });

export const springComfort = (stiffness = 180, damping = 24): Transition => ({
  type: 'spring', stiffness, damping,
});

/* ─── SCROLL REVEALS ─── */

/** Stagger container — three-dimensional curtain reveal */
export const curtainIn = (
  staggerMs = 0.09,
  delayMs   = 0,
): Variants => ({
  hidden: { opacity: 0, y: 55, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1], // decelerating cubic-bezier
      delay: delayMs,
      staggerChildren: staggerMs,
    },
  },
});

/** Single item within curtainIn */
export const curtainItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

/** General scroll-reveal for standalone elements */
export const scrollReveal = (
  distance = 52,
  once     = true,
  margin   = '-80px 0px -100px 0px',
): Record<string, any> => ({
  initial:   { opacity: 0, y: distance },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once, margin },
  transition: {
    type: 'spring',
    stiffness: 110,
    damping: 28,
  },
});

/** Intersection-based staggered container */
export const scrollStagger = (staggerMs = 0.12, delayMs = 0): Variants => ({
  hidden: { opacity: 0, y: 44, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration   : 0.95,
      ease       : [0.16, 1, 0.3, 1],
      staggerChildren: staggerMs,
      delayChildren  : delayMs,
    },
  },
});

/** Child item for scrollStagger */
export const scrollStaggerItem: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 140,
      damping: 26,
    },
  },
};

/* ─── HOVER MOTIONS ─── */

/** Slight upward lift on hover */
export const floatHover = {
  whileHover: { y: -6, scale: 1.015 },
  ...springComfort(260, 26),
};

/** Glow-case expansion */
export const glowHover = {
  whileHover: { boxShadow: '0 0 32px rgba(34,211,238,0.22)', y: -2 },
  ...springComfort(),
};

/** 3D tilt — use with rotateX/rotateY driven by mouse */
export const tilt3D_default = {
  rotateX: -8,
  rotateY: 6,
  scale: 1.025,
  ...springComfort(200, 22),
};

/** Magnetic button pull */
export const magneticPull = (strength = 0.25): Record<string, any> => ({
  whileHover:  { scale: 1.04 },
  whileTap:    { scale: 0.97 },
  transition:  { type: 'spring', stiffness: 380, damping: 22 },
});

/* ─── PAGE TRANSITIONS ─── */

/** Full-page cinematic enter — page loads
 *  Usage: `animate={pageEnter}` or set as initial/visible states.
 */
export const pageEnter: Target = {
  opacity: 1,
  y: 0,
};

/** Helper record for page enter animation (use as `transition` prop) */
export const pageEnterTransition: Transition = {
  type: 'spring',
  stiffness: 90,
  damping: 22,
};

/** Page-enter initial state — combine with `pageEnterTransition` */
export const pageEnterInitial: Record<string, any> = {
  opacity: 0,
  y: 60,
  transition: pageEnterTransition,
};

/** Cinematic scene exit */
export const sceneExit = (direction: 'up' | 'down' = 'up'): Record<string, any> => ({
  opacity: 0,
  y:      direction === 'up' ? -80 : 80,
  scale:  0.97,
  transition: { duration: 0.5, ease: [0.4, 0, 1, 1] },
});

/* ─── ENVIRONMENTAL MOTIONS ─── */

/** Continuous slow float — for background orbs */
export const atmosphericFloat = (dur = 14, delay = 0): Transition => ({
  repeat          : Infinity,
  repeatType      : 'reverse',
  duration        : dur,
  delay,
  ease            : 'easeInOut',
});

/** Letterbox wipe opening */
export const letterboxOpen = (delayMs = 0.6): Variants => ({
  hidden: {
    clipPath: 'inset(45% 0% 45% 0%)',
    opacity: 0,
  },
  visible: {
    clipPath: 'inset(0% 0% 0% 0%)',
    opacity: 1,
    transition: {
      type:       'spring',
      stiffness:  140,
      damping:    26,
      delay:      delayMs,
      ease:       [0.16, 1, 0.3, 1],
    },
  },
});

/* ─── BACKWARD COMPATIBILITY ─── */
// Keep the original names for components that still import them.
export const staggerContainer = curtainIn(0.09, 0);
export const staggerItem = curtainItem;
export const scrollRevealStagger = {
  container: {
    hidden: scrollStagger(0.14, 0.2).hidden,
    visible: scrollStagger(0.14, 0.2).visible,
  },
  item: scrollStaggerItem,
};
