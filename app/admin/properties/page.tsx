'use client';

import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { useState } from 'react';

const mockProperties = [
  { id: 1, title: 'Luxury Apartment Downtown', landlord: 'Jane Smith', price: 'KES 25,000/mo', status: 'verified', bookings: 12 },
  { id: 2, title: 'Modern Studio Kilimani', landlord: 'Alice Brown', price: 'KES 18,000/mo', status: 'verified', bookings: 8 },
  { id: 3, title: 'Family House Westlands', landlord: 'John Developer', price: 'KES 45,000/mo', status: 'pending', bookings: 5 },
  { id: 4, title: 'Cozy Apartment Nairobi', landlord: 'Jane Smith', price: 'KES 15,000/mo', status: 'verified', bookings: 15 },
];

export default function AdminPropertiesPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');

  const filteredProperties = mockProperties.filter(
    (prop) => statusFilter === 'all' || prop.status === statusFilter
  );

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Manage Properties</h1>
        <p className="text-gray-400">Review and moderate property listings</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex gap-4">
          {['all', 'verified', 'pending'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Properties Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 gap-6"
      >
        {filteredProperties.map((property) => (
          <GlassmorphicCard key={property.id}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">{property.title}</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Landlord</p>
                    <p className="text-white font-medium">{property.landlord}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Monthly Price</p>
                    <p className="text-white font-medium">{property.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Active Bookings</p>
                    <p className="text-white font-medium">{property.bookings}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    property.status === 'verified'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {property.status.toUpperCase()}
                </span>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  Review
                </button>
              </div>
            </div>
          </GlassmorphicCard>
        ))}
      </motion.div>
    </div>
  );
}
