'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AdminNav } from '@/components/AdminNav';
import { PropertyForm } from '@/components/PropertyForm';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function CreatePropertyPage() {
  return (
    <main className="min-h-screen bg-background">
      <AdminNav />

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Header */}
            <motion.div variants={staggerItem} className="mb-12">
              <h1 className="text-4xl font-bold text-white mb-2">
                Create New Property
              </h1>
              <p className="text-gray-400">
                List your property and start earning with Dwell KE
              </p>
            </motion.div>

            {/* Form */}
            <motion.div variants={staggerItem}>
              <PropertyForm />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}