'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { DashboardNav } from '@/components/DashboardNav';
import { HotelPropertyForm } from '@/components/HotelPropertyForm';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function CreateHotelPropertyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="flex">
        <DashboardNav role="hotel" />

        <div className="flex-1 p-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={staggerItem} className="mb-12">
              <h1 className="text-4xl font-bold text-white mb-2">
                Add New Room
              </h1>
              <p className="text-gray-400">
                List your hotel room and start earning with Dwell KE
              </p>
            </motion.div>

            <motion.div variants={staggerItem}>
              <HotelPropertyForm />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}