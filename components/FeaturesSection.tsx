'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { GlassmorphicCard } from './GlassmorphicCard';
import { FEATURES } from '@/lib/constants';
import { scrollReveal } from '@/lib/animations';

/* ─────────────────────────────────────
   FEATURES SECTION — Cinematic Reimagined
   Asymmetric floating glass panels
   with cinematic hover depth
───────────────────────────────────── */

const tileConfigs = [
  { span: 'col-span-2', gravity: 1.2 },
  { span: 'col-span-1', gravity: 0.8 },
  { span: 'col-span-1', gravity: 1.0 },
  { span: 'col-span-1', gravity: 0.9 },
  { span: 'col-span-1', gravity: 1.3 },
  { span: 'col-span-1', gravity: 0.7 },
  { span: 'col-span-2', gravity: 1.1 },
  { span: 'col-span-1', gravity: 0.85 },
];

function TiltedCard({ config, feature, index }: { config: typeof tileConfigs[0]; feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const rX = useTransform(my, [0, 1], [12, -12]);
  const rY = useTransform(mx, [0, 1], [-12, 12]);
  const bgX = useTransform(mx, [0, 1], ['0%', '100%']);
  const bgY = useTransform(my, [0, 1], ['0%', '100%']);

  const gradientMap = [
    'from-cyan-400/0 via-cyan-400/10 to-blue-500/0',
    'from-violet-500/0 via-violet-500/10 to-fuchsia-500/0',
    'from-emerald-400/0 via-emerald-400/10 to-teal-500/0',
    'from-blue-400/0 via-blue-400/10 to-cyan-500/0',
  ];

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top)  / rect.height);
  };

  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      style={{ rotateX: rX, rotateY: rY, transformStyle: 'preserve-3d' }}
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px 0px' }}
      transition={{
        type: 'spring',
        damping: 26,
        stiffness: 80,
        delay: index * 0.09,
      }}
      className={`${config.span} perspective-[900px]`}
      whileHover={{ scale: 1.025 }}
    >
      <GlassmorphicCard
        className={`
          relative overflow-hidden py-7 px-6
          group transition-all duration-500
          border border-cyan-400/[0.07]
          hover:border-cyan-400/30 hover:bg-white/[0.07]
          shadow-[0_8px_40px_-12px_rgba(0,0,0,0.7)]
          hover:shadow-[0_0_60px_-12px_rgba(34,211,238,0.18)]
        `}
      >
        {/* ─ Mouse-following radial glow ─ */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: `radial-gradient(
              240px circle at ${bgX} ${bgY},
              rgba(34,211,238,0.10),
              transparent
            )`,
          }}
        />

        {/* ─ Accent strip left ─ */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-[2px]
                     bg-gradient-to-b from-cyan-400/0 via-cyan-400/40 to-cyan-400/0
                     group-hover:via-cyan-400/70"
          layoutId={`feature-accent-${index}`}
        />

        <div className="relative z-10">
          {/* ─ Large icon wordmark ─ */}
          <div className="mb-6 flex items-center justify-between">
            <span className="
              text-3xl font-black font-serif
              bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent
              group-hover:from-cyan-300 group-hover:to-blue-400
              transition-all duration-700
            ">{index + 1}</span>
            <span className={`text-4xl bg-gradient-to-br ${gradientMap[index % gradientMap.length]} bg-clip-text text-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500`}>
              {feature.icon}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mb-3 tracking-tight group-hover:text-cyan-100 transition-colors duration-400">
            {feature.title}
          </h3>

          <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-400">
            {feature.description}
          </p>
        </div>
      </GlassmorphicCard>
    </motion.div>
  );
}

/* ════════════════════════════════════════ */
export function FeaturesSection() {
  return (
    <section
      className="relative py-32"
      style={{ background: `
        radial-gradient(ellipse 80% 50% at 10% 60%, rgba(34,211,238,0.04) 0%, transparent 70%),
        radial-gradient(ellipse 60% 40% at 90% 30%, rgba(139,92,246,0.03) 0%, transparent 70%),
        var(--bg-obsidian)
      ` }}
    >
      {/* ─ Subtle mesh-grid overlay ─ */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
        aria-hidden="true"
      />

      {/* ─ Very faint sweep ─ */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, transparent 10%, rgba(34,211,238,0.018) 50%, transparent 90%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">

        {/* ── Section header — editorial spacing ── */}
        <motion.div
          {...scrollReveal}
          className="mb-20 max-w-3xl"
        >
          <p className="text-[10px] uppercase tracking-[0.45em] font-mono text-cyan-400/50 mb-4">
            Why Dwell KE
          </p>
          <h2 className="
            font-serif font-black tracking-[-0.03em] leading-[0.85]
            text-white text-[clamp(2.5rem,5.5vw,4.5rem)]
            mb-6
          ">
            We think{' '}
            <span className="text-gradient">differently</span>{' '}
            about property.
          </h2>
          <div className="h-px w-20 bg-gradient-to-r from-cyan-400/60 to-transparent mb-5" />
          <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed">
            A platform designed by people who know the pain points — because we&apos;ve lived them.
          </p>
        </motion.div>

        {/* ── Asymmetric grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-5">
          {FEATURES.map((f, i) => (
            <TiltedCard key={f.title} config={tileConfigs[i]} feature={f} index={i} />
          ))}
        </div>

      </div>

      <div className="scene-divider mt-32" />
    </section>
  );
}
