'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { motion } from 'framer-motion';
import { scrollReveal } from '@/lib/animations';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div {...scrollReveal} className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-2">Contact Us</h1>
            <p className="text-gray-400 text-lg">
              Have a question? We&apos;d love to hear from you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: 'Email',
                value: 'hello@dwellke.com',
                icon: '📧',
              },
              {
                title: 'Phone',
                value: '+254 (0) 123 456 789',
                icon: '📱',
              },
              {
                title: 'Location',
                value: 'Nairobi, Kenya',
                icon: '📍',
              },
            ].map((contact) => (
              <motion.div key={contact.title} {...scrollReveal}>
                <GlassmorphicCard>
                  <div className="text-center">
                    <p className="text-3xl mb-4">{contact.icon}</p>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {contact.title}
                    </h3>
                    <p className="text-gray-400">{contact.value}</p>
                  </div>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </div>

          <motion.div {...scrollReveal}>
            <GlassmorphicCard>
              <h2 className="text-2xl font-bold text-white mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="How can we help?"
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us more..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
                    required
                  />
                </div>

                <PremiumButton
                  variant="solid"
                  size="lg"
                  type="submit"
                  className="w-full"
                >
                  Send Message
                </PremiumButton>
              </form>
            </GlassmorphicCard>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
