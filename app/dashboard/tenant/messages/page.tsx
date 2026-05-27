'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ContactForm } from '@/components/ContactForm';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { DashboardNav } from '@/components/DashboardNav';
import { Footer } from '@/components/Footer';

export default function TenantContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      <DashboardNav role="tenant" />

      <div className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/dashboard/tenant">
                <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                  ← Back to Dashboard
                </button>
              </Link>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Contact Support</h1>
              <p className="text-gray-400">Have a question or issue? We're here to help. Send us a message and our team will get back to you within 24 hours.</p>
            </div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassmorphicCard>
              <ContactForm onSuccess={() => setSubmitted(true)} />
            </GlassmorphicCard>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
