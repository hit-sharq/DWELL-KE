'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [form, setForm]           = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to send');
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[10px] uppercase tracking-[0.4em] font-mono text-cyan-400/50 mb-4">
              Get In Touch
            </p>
            <h1 className="font-serif font-black text-white text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.9] mb-6">
              Let&apos;s build something{' '}
              <span className="text-gradient">great</span>
            </h1>
            <p className="text-gray-400 text-lg font-light max-w-lg mx-auto">
              We&apos;d love to hear from you — whether you&apos;re a tenant, landlord, or just curious.
            </p>
          </motion.div>

          {/* ── Contact Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {[
              { title: 'Email',    value: 'hello@dwellke.com',        icon: '📧' },
              { title: 'Phone',    value: '+254 (0) 110 123 456',     icon: '📱' },
              { title: 'Location', value: 'Nairobi, Kenya',           icon: '📍' },
            ].map((c) => (
              <GlassmorphicCard key={c.title} className="text-center group">
                <p className="text-2xl mb-3 group-hover:scale-110 transition-transform">{c.icon}</p>
                <h3 className="text-base font-bold text-white mb-1.5">{c.title}</h3>
                <p className="text-gray-400 text-sm">{c.value}</p>
              </GlassmorphicCard>
            ))}
          </div>

          {/* ── Contact Form ── */}
          {submitted ? (
            <GlassmorphicCard className="text-center py-16">
              <p className="text-4xl mb-4">🎉</p>
              <h2 className="text-2xl font-bold text-white mb-2">Message sent!</h2>
              <p className="text-gray-400">We&apos;ll get back to you within 24 hours.</p>
              <PremiumButton variant="solid" className="mt-8" onClick={() => setSubmitted(false)}>
                Send Another
              </PremiumButton>
            </GlassmorphicCard>
          ) : (
            <GlassmorphicCard>
              <h2 className="text-2xl font-bold text-white mb-8">Send us a Message</h2>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-gray-500 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={update}
                      required
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-900/80 border border-slate-700/50 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-gray-500 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={update}
                      required
                      className="w-full px-5 py-3.5 rounded-xl bg-slate-900/80 border border-slate-700/50 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-gray-500 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={update}
                    required
                    className="w-full px-5 py-3.5 rounded-xl bg-slate-900/80 border border-slate-700/50 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 transition-all"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-gray-500 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={update}
                    required
                    rows={6}
                    className="w-full px-5 py-3.5 rounded-xl bg-slate-900/80 border border-slate-700/50 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 transition-all resize-none"
                    placeholder="Tell us more about your inquiry…"
                  />
                </div>

                <div className="pt-2">
                  <PremiumButton
                    variant="solid"
                    size="lg"
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? 'Sending…' : 'Send Message'}
                  </PremiumButton>
                </div>
              </form>
            </GlassmorphicCard>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
