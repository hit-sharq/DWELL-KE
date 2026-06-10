'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { GlassmorphicCard } from './GlassmorphicCard';
import { PremiumButton } from './PremiumButton';
import { scrollReveal } from '@/lib/animations';
import { useIsMobile } from '@/hooks/use-mobile';

const steps = [
  {
    num: '01',
    title: 'Discover',
    desc: 'Browse verified properties with real photos, real locations, and real reviews.',
    icon: '🔍',
  },
  {
    num: '02',
    title: 'Verify',
    desc: 'Chat with landlords, verify details, and get AI-powered fraud detection for peace of mind.',
    icon: '✓',
  },
  {
    num: '03',
    title: 'Book',
    desc: 'Secure your stay instantly with M-Pesa. No deposits, no surprises.',
    icon: '💳',
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const rotateX = useTransform(my, [0, 1], [isMobile ? 0 : 10, isMobile ? 0 : -10]);
  const rotateY = useTransform(mx, [0, 1], [isMobile ? 0 : -10, isMobile ? 0 : 10]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    if (isMobile) return;
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring', damping: 24, stiffness: 90, delay: index * 0.1 }}
      className="flex flex-col items-center text-center p-8"
      whileHover={{ scale: isMobile ? 1 : 1.03 }}
    >
      <GlassmorphicCard className="w-full h-full flex flex-col items-center p-8">
        <div className="text-5xl mb-5">{step.icon}</div>
        <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-cyan-400/60 mb-3">
          {step.num}
        </span>
        <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
      </GlassmorphicCard>
    </motion.div>
  );
}

export function HowItWorksSection() {
  return (
    <section
      className="relative py-10 sm:py-14 overflow-hidden"
      style={{ background: `
        radial-gradient(ellipse 60% 40% at 20% 40%, rgba(34,211,238,0.04) 0%, transparent 70%),
        radial-gradient(ellipse 40% 30% at 80% 60%, rgba(139,92,246,0.03) 0%, transparent 70%),
        var(--bg-obsidian)
      ` }}
    >
      <div className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        <motion.div {...scrollReveal} className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.45em] font-mono text-cyan-400/50 mb-4">
            How It Works
          </p>
          <h2 className="font-serif font-black tracking-[-0.03em] leading-[0.85] text-white text-[clamp(2rem,4.5vw,3.5rem)] mb-6">
            Your perfect home in <span className="text-gradient">three steps</span>
          </h2>
          <div className="h-px w-16 bg-gradient-to-r from-cyan-400/60 to-transparent mx-auto mb-5" />
          <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed">
            From discovery to move-in, we&apos;ve streamlined every touchpoint for a seamless experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {steps.map((s, i) => (
            <StepCard key={s.title} step={s} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Link href="/marketplace">
            <PremiumButton variant="solid" size="lg" className="min-w-[240px]">
              Start Exploring
            </PremiumButton>
          </Link>
        </motion.div>
      </div>

      <div className="scene-divider mt-32" />
    </section>
  );
}