'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { FEATURES } from '@/lib/constants';
import { scrollReveal } from '@/lib/animations';

const tileConfigs = [
  { span: 'col-span-2', gravity: 1.2 },
  { span: 'col-span-1', gravity: 0.8 },
  { span: 'col-span-1', gravity: 1.0 },
  { span: 'col-span-1', gravity: 0.9 },
  { span: 'col-span-1', gravity: 1.3 },
  { span: 'col-span-1', gravity: 0.7 },
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
    my.set((e.clientY - rect.top) / rect.height);
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

        <motion.div
          className="absolute left-0 top-0 bottom-0 w-[2px]
                     bg-gradient-to-b from-cyan-400/0 via-cyan-400/40 to-cyan-400/0
                     group-hover:via-cyan-400/70"
          layoutId={`feature-accent-${index}`}
        />

        <div className="relative z-10">
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

interface AboutContentProps {
  FEATURES: typeof FEATURES;
}

const missionStats = [
  { val: '5K+', label: 'Properties Verified', icon: '🏢' },
  { val: '10K+', label: 'Happy Tenants', icon: '😊' },
  { val: '500+', label: 'Trusted Developers', icon: '🏗️' },
  { val: '24/7', label: 'Support', icon: '🕐' },
];

export function AboutContent({ FEATURES }: AboutContentProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10">

      <motion.div
        {...scrollReveal}
        className="mb-24 max-w-3xl"
      >
        <p className="text-[10px] uppercase tracking-[0.45em] font-mono text-cyan-400/50 mb-4">
          Our Philosophy
        </p>
        <h1 className="
          font-serif font-black tracking-[-0.03em] leading-[0.85]
          text-white text-[clamp(2.5rem,5.5vw,4.5rem)]
          mb-6
        ">
          Built for <span className="text-gradient">Kenya</span>,
          <br />by Kenya.
        </h1>
        <div className="h-px w-20 bg-gradient-to-r from-cyan-400/60 to-transparent mb-5" />
        <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed">
          Dwell KE exists to revolutionize property rental in Kenya. We&apos;re building the most trusted platform
          for connecting tenants with verified landlords, ensuring secure, transparent, and seamless
          transactions powered by M-Pesa integration and advanced fraud detection.
        </p>
      </motion.div>

      <motion.div
        {...scrollReveal}
        transition={{ delay: 0.1 }}
        className="mb-28"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <TiltedCard key={f.title} config={tileConfigs[i]} feature={f} index={i} />
          ))}
        </div>
      </motion.div>

      <motion.div
        {...scrollReveal}
        transition={{ delay: 0.2 }}
        className="mb-24"
      >
        <div className="glass-strong rounded-3xl p-10 md:p-14 border border-cyan-400/8 relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(34,211,238,0.6) 1px, transparent 1px),
                linear-gradient(90deg, rgba(34,211,238,0.6) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">By the Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {missionStats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl mb-2">{s.icon}</div>
                  <p className="text-3xl md:text-4xl font-black font-serif bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">
                    {s.val}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400/70 font-mono mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        {...scrollReveal}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
        <div className="space-y-4 text-gray-400">
          <p className="leading-relaxed">
            We&apos;ve lived the frustration of endless property searches, sketchy landlords, and payment
            uncertainty. That&apos;s why we built Dwell KE — to eliminate the guesswork from renting in Kenya.
          </p>
          <p className="leading-relaxed">
            Every feature, every process, every decision is driven by real experiences. We don&apos;t just
            connect tenants and landlords; we build trust through verification, transparency, and technology.
          </p>
        </div>

        <div className="pt-4">
          <Link href="/careers">
            <PremiumButton variant="outline" size="lg">
              Join Our Mission
            </PremiumButton>
          </Link>
        </div>
      </motion.div>

    </div>
  );
}