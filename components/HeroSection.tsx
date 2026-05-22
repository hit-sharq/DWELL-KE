'use client';

import React, { useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { LuxuryCity3D } from './LuxuryCity3D';
import { PremiumButton } from './PremiumButton';
import { BRAND, NAV_LINKS } from '@/lib/constants';

/* ─── Cinematic scroll config ─── */
const springLoose = { damping: 20, stiffness: 120 };
const springSnappy = { damping: 28, stiffness: 340 };

/* ─── Cinematic stagger ─── */
const curtainIn = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)', y: 80, opacity: 0 },
  visible: {
    clipPath: 'inset(0% 0% 0%  0%)',
    y: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 26, stiffness: 180, duration: 1.1 },
  },
};

const curtainInDelayed = (delay: number) => ({
  ...curtainIn,
  visible: { ...curtainIn.visible, transition: { ...curtainIn.visible.transition as any, delay } },
});

/* ─── Mouse parallax hook ─── */
function useParallax() {
  const mx = useSpring(useMotionValue(0), springLoose);
  const my = useSpring(useMotionValue(0), springLoose);
  const pmx = useTransform(mx, (x) => x * 32);
  const pmy = useTransform(my, (y) => y * 32);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth: w, innerHeight: h } = window;
    const nx = (e.clientX / w - 0.5) * 2;
    const ny = (e.clientY / h - 0.5) * 2;
    mx.set(nx);
    my.set(ny);
  }, [mx, my]);

  return { handleMove, pmx, pmy, nx: mx, ny: my };
}

/* ─── Floating ambient particles (CSS) ─── */
function CineParticles() {
  const particles = useMemo(() => {
    const count = 40;
    return Array.from({ length: count }, (_, i) => {
      const dur = 6 + Math.random() * 12;
      const del = Math.random() * -10;
      const sz = 1.5 + Math.random() * 3;

      return {
        id: i,
        x: `${(Math.random() * 100).toFixed(1)}%`,
        y: `${(Math.random() * 100).toFixed(1)}%`,
        dur: `${dur.toFixed(1)}s`,
        del: `${del.toFixed(1)}s`,
        sz: `${sz}px`,
        // Note: opacity and boxShadow are intentionally computed inline
        // (without hooks) so they do not require nested hook calls.
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-cyan-400 animate-[float-node_var_1_ease-in-out_infinite]"
          style={{
            left: p.x,
            top: p.y,
            width: p.sz,
            height: p.sz,
            animationDuration: p.dur,
            animationDelay: p.del,
            opacity: 0.15 + Math.random() * 0.35,
            boxShadow: `0 0 ${Math.random() * 8 + 4}px rgba(34,211,238,0.4)`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Scanning line sweep ─── */
function ScanSweep() {
  return (
    <motion.div
      className="pointer-events-none absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent z-[5]"
      initial={{ top: '-2%', opacity: 0 }}
      animate={{ top: ['-2%', '102%'], opacity: [0, 1, 0] }}
      transition={{ duration: 16, repeat: Infinity, ease: 'linear', delay: 3 }}
    />
  );
}

/* ─── Neon ticker row ─── */
function NeonTicker() {
  const labels = useMemo(
    () =>
      [
        'Nairobi · Rooftop Penthouses', 'Mombasa · Oceanfront Residences', 'Nakuru · Modern Family Villas',
        'Kisumu · Lakeview Escapes', 'Kilifi · Beachfront Aparthotels', 'Westlands · High-Rise Living',
        'Diani · Coastal Retreats', 'Karen · Luxury Estates',
      ],
    []
  );

  return (
    <div className="pointer-events-none absolute -bottom-1 left-0 right-0 z-[5] overflow-hidden py-2.5 select-none">
      <motion.div
        className="flex whitespace-nowrap gap-20"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        {[...labels, ...labels].map((l, i) => (
          <span
            key={i}
            className="text-[10px] uppercase tracking-[0.3em] font-mono text-cyan-500/30"
          >
            {l}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════
   HERO SECTION  –  MAIN EXPORT
════════════════════════════════════════ */
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const yRef    = useTransform(scrollY, [0, 800], [0,  280], { clamp: true });
  const yHead   = useTransform(scrollY, [0, 700], [0, -180], { clamp: true });
  const yFade   = useTransform(scrollY, [0, 600], [0,  120], { clamp: true });

  const { handleMove, pmx, pmy } = useParallax();

  /* ── geometric decorative orbs (CSS, not canvas) ── */
  const orbs = useMemo(
    () =>
      [
        { size: 320, x: '84%', y: '12%', color: 'bg-cyan-400', blur: 100, dur: 20 },
        { size: 240, x: '8%',  y: '62%', color: 'bg-violet-500', blur: 80,  dur: 26 },
        { size: 180, x: '55%', y: '78%', color: 'bg-emerald-500', blur: 70, dur: 22 },
        { size: 350, x: '-5%', y: '-5%', color: 'bg-blue-600',   blur: 120, dur: 30 },
      ],
    []
  );

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMove}
      className="relative h-[100vh] min-h-[680px] overflow-hidden"
    >
      {/*
       * Layer 0 — cinematic base gradient
       */}
      <div className="absolute inset-0 -z-20 gradient-surface" />

      {/*
       * Layer 1 — 3D city scene
       */}
      <motion.div
        style={{ transform: useTransform([yRef, pmx], ([y, x]) => `translate3d(${x}px,${y}px,0)`) }}
        className="absolute inset-0 -z-10 opacity-85"
      >
        <LuxuryCity3D />
      </motion.div>

      {/*
       * Layer 2 — atmospheric fog / glow orbs
       */}
      <div className="absolute inset-0 -z-[5] pointer-events-none overflow-hidden">
        {orbs.map((o, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${o.color}`}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.12, 0.35, 0.12, 0], scale: [0.8, 1.15, 1, 0.9, 1] }}
            transition={{ duration: o.dur, repeat: Infinity, delay: i * 3, ease: 'easeInOut' }}
            style={{
              left: o.x,
              top: o.y,
              width: o.size,
              height: o.size,
              filter: `blur(${o.blur}px)`,
            }}
          />
        ))}
      </div>

      {/*
       * Layer 3 — noise grain
       */}
      <div className="noise-overlay -z-[3]" aria-hidden="true" />

      {/*
       * Layer 4 — floating particles
       */}
      <div className="-z-[2]">
        <CineParticles />
      </div>

      {/*
       * Layer 5 — scan sweep
       */}
      <ScanSweep />

      {/*
       * Layer 6 — neon ticker
       */}
      <NeonTicker />

      {/*
       * ─  CONTENT OVERLAY ─
       */}
      <div
        className="relative z-10 h-full flex flex-col"
        style={{ transform: `translateY(${yRef}px)` }}
      >
        <div className="flex-1 flex flex-col" onMouseMove={handleMove}>

          {/* ── ANCHOR TAGS (top-left floating) ── */}
          <motion.div
            variants={curtainInDelayed(0)}
            initial="hidden"
            animate="visible"
            className="absolute top-[18%] left-[7%] hidden lg:flex flex-col gap-3"
            style={{ x: pmy, y: pmy }}
          >
            {NAV_LINKS.filter((l) => l.href !== '/').map((l) => (
              <Link key={l.href} href={l.href}>
                <span
                  className="block px-4 py-2 glass text-[11px] uppercase tracking-[0.25em]
                             font-mono text-gray-400 hover:text-cyan-300 transition-colors cursor-pointer rounded-full"
                >
                  {l.label}
                </span>
              </Link>
            ))}
          </motion.div>

          {/* ── CINEMATIC HEADLINE ── */}
          <div className="flex-1 flex items-center">
            <div className="max-w-7xl mx-auto w-full px-6 lg:px-10">
              <div className="relative" style={{ transform: `translateY(${yHead}px)` }}>

                {/* ── Micro-badge ── */}
                <motion.div
                  variants={curtainInDelayed(0.1)}
                  initial="hidden"
                  animate="visible"
                  className="mb-8"
                >
                  <span className="inline-flex items-center gap-2.5 glass-strong px-5 py-2 rounded-full
                                  border-cyan-400/12 shadow-lg">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400/70" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.35em] font-mono text-cyan-200/90">
                      Kenya&apos;s Premiere Property Platform
                    </span>
                  </span>
                </motion.div>

                {/* ── H1 — ultra-bold cinematic ── */}
                <motion.h1
                  initial={{ opacity: 0, y: 60, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 90, delay: 0.15, duration: 1.4 }}
                  className={`
                    font-serif font-black
                    leading-[0.82] tracking-[-0.035em]
                    text-white
                    text-[clamp(3.2rem,10vw,9.5rem)]
                    mb-4
                  `}
                >
                  <span className="block">Live.</span>
                  <span className="block">
                    <span className="text-gradient">Verify.</span>
                  </span>
                  <span className="block text-transparent bg-clip-text
                    bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-400">
                    Dwell.
                  </span>
                </motion.h1>

                {/* ── Animated rule ── */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.8, delay: 0.6, ease: [0.76, 0, 0.24, 1] }}
                  className="h-px bg-gradient-to-r from-cyan-400/80 via-blue-500/50 to-transparent origin-left mb-8"
                  style={{ maxWidth: 480 }}
                />

                {/* ── Subcopy ── */}
                <motion.p
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                  className="text-base md:text-lg lg:text-xl text-gray-300/80
                             font-light leading-relaxed max-w-2xl mb-12"
                >
                  Verified luxury properties across Kenya — curated,
                  authenticated, and bookable in seconds.
                  <span className="text-cyan-300/90 font-medium"> {BRAND.name}</span> redefines the smart city standard.
                </motion.p>

                {/* ── CTA Row + floating info strip ── */}
                <motion.div
                  initial={{ opacity: 0, y: 36 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.1, delay: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex flex-col xl:flex-row xl:items-end gap-8"
                >
                  {/* Primary CTAs */}
                  <div className="flex flex-wrap gap-4">
                    <Link href="/marketplace" className="group">
                      <PremiumButton variant="solid" size="lg" className="min-w-[220px] relative overflow-hidden">
                        Explore Properties
                      </PremiumButton>
                      <span
                        className="
                          pointer-events-none absolute inset-0 rounded-lg
                          bg-gradient-to-r from-transparent via-white/10 to-transparent
                          translate-x-[-120%] group-hover:translate-x-[220%]
                          transition-all duration-700 ease-in-out
                        "
                      />
                    </Link>
                    <Link href="/auth/signup">
                      <PremiumButton variant="outline" size="lg" className="min-w-[200px]">
                        Create Account
                      </PremiumButton>
                    </Link>
                  </div>

                  {/* Solar stats strip — floats right */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 150, delay: 1.2 }}
                    className="glass-strong rounded-2xl px-7 py-5 xl:py-6 border-cyan-400/10 group
                               hover:border-cyan-400/25 transition-all duration-500"
                  >
                    <div className="flex items-center gap-6">
                      {[
                        { val: '5K+',  label: 'Properties',    color: 'from-cyan-300 to-blue-400' },
                        { val: '10K+', label: 'Happy Tenants', color: 'from-blue-400 to-cyan-300' },
                        { val: '500+', label: 'Developers',    color: 'from-emerald-400 to-green-400' },
                      ].map((s, i) => (
                        <div key={i} className="text-center">
                          <p
                            className={`text-2xl md:text-3xl font-black font-serif bg-clip-text text-transparent
                                       bg-gradient-to-r ${s.color}`}
                          >
                            {s.val}
                          </p>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400/70 font-sans mt-1">
                            {s.label}
                          </p>
                        </div>
                      ))}
                      <div className="h-10 w-px bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent" />
                      <div className="leading-tight">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-cyan-300/70 font-mono leading-relaxed">
                          Trust Score
                        </p>
                        <p className="text-2xl font-black font-serif text-cyan-300">98.6</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

              </div>
            </div>
          </div>

          {/* ── SCROLL INDICATOR ── */}
          <div className="pb-6 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ duration: 1, delay: 2.8, ease: 'easeOut' }}
              className="flex flex-col items-center gap-2 pointer-events-none"
            >
              <span className="text-[9px] uppercase tracking-[0.4em] font-mono text-gray-500">
                Scroll to explore
              </span>
              <div className="relative w-4 h-8 rounded-full border border-gray-600/60 flex justify-center pt-1.5">
                <motion.div
                  className="w-0.5 h-2 bg-cyan-400 rounded-full"
                  animate={{ y: [0, 10, 0], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
