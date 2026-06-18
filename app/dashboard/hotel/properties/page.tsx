'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { PremiumButton } from '@/components/PremiumButton';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { DashboardNav } from '@/components/DashboardNav';
import { Footer } from '@/components/Footer';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  status: string;
  verified: boolean;
  images: string[];
  _count: {
    bookings: number;
    reviews: number;
  };
}

export default function HotelPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/hotel/properties');
      if (!response.ok) throw new Error('Failed to fetch properties');
      const data = await response.json();
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      const response = await fetch(`/api/hotel/properties?id=${propertyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete property');

      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete property');
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <DashboardNav role="hotel" />

      <div className="flex">
        <div className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Link href="/dashboard/hotel">
                    <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                      ← Back to Dashboard
                    </button>
                  </Link>
                  <h1 className="text-4xl font-bold text-white">My Hotel Rooms</h1>
                </div>
                <Link href="/dashboard/hotel/properties/new">
                  <PremiumButton variant="solid">Add New Room</PremiumButton>
                </Link>
              </div>
              <p className="text-gray-400">
                {properties.length} rooms listed
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12 text-gray-400">
                Loading properties...
              </div>
            ) : properties.length === 0 ? (
              <GlassmorphicCard>
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg mb-4">
                    You haven't listed any rooms yet
                  </p>
                  <Link href="/dashboard/hotel/properties/new">
                    <PremiumButton variant="solid">Create Your First Room</PremiumButton>
                  </Link>
                </div>
              </GlassmorphicCard>
            ) : (
              <div className="space-y-4">
                {properties.map((prop) => (
                  <motion.div
                    key={prop.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GlassmorphicCard>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-800 to-slate-900">
                          {prop.images?.[0] ? (
                            <Image
                              src={prop.images[0]}
                              alt={prop.title}
                              width={192}
                              height={192}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                              No Image
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-white">
                                {prop.title}
                              </h3>
                              <p className="text-gray-400">{prop.location}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              {prop.verified ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400">
                                  Verified
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/15 text-yellow-400">
                                  Pending
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                prop.status === 'available'
                                  ? 'bg-green-500/15 text-green-400'
                                  : 'bg-red-500/15 text-red-400'
                              }`}>
                                {prop.status}
                              </span>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
                            <div>
                              <span className="text-gray-500">Price:</span>{' '}
                              <span className="text-cyan-400 font-semibold">
                                KES {prop.price.toLocaleString()}/night
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Rooms:</span>{' '}
                              {prop.bedrooms} bed, {prop.bathrooms} bath
                            </div>
                            <div>
                              <span className="text-gray-500">Activity:</span>{' '}
                              {prop._count.bookings} bookings, {prop._count.reviews} reviews
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 md:w-32 justify-start">
                          <Link href={`/properties/${prop.id}`}>
                            <button className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm font-semibold">
                              View
                            </button>
                          </Link>
                          <Link href={`/dashboard/hotel/properties/${prop.id}/edit`}>
                            <button className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors text-sm font-semibold">
                              Edit
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(prop.id)}
                            className="w-full px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </GlassmorphicCard>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}