'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface Hotel {
  id: string;
  name: string;
  description: string | null;
  location: string;
  starRating: number | null;
  amenities: string[];
  images: string[];
  verified: boolean;
  featured: boolean;
  _count?: {
    properties: number;
  };
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/hotels');
        const payload: any = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.error || `Server error (${response.status})`);
        setHotels(payload);
        setFilteredHotels(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load hotels');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHotels();
  }, []);

  useEffect(() => {
    let filtered = hotels;
    if (searchQuery) {
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredHotels(filtered);
  }, [hotels, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-950">
      <Navigation />
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 pt-24 pb-12"
      >
        <motion.div variants={staggerItem} className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-2 glass-strong px-4 py-1.5 rounded-full border-cyan-400/12 shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400/70" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] font-mono">
                <span className="text-cyan-300">Hotel</span>
                <span className="text-white/90">Partners</span>
              </span>
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Hotel Partners
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Explore premium hotels across Kenya — from luxury resorts to boutique accommodations
          </p>
          <div className="h-px bg-gradient-to-r from-cyan-400/80 via-blue-500/50 to-transparent mt-6 mb-8" style={{ maxWidth: 480 }} />
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          <motion.div variants={staggerItem} className="lg:col-span-1">
            <div className="sticky top-8 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/40 to-slate-900/20 backdrop-blur p-5 space-y-5">
              <div>
                <h3 className="font-bold text-white mb-3">Search Hotels</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Search Location or Hotel
                </label>
                <input
                  type="text"
                  placeholder="Search hotels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all text-sm"
                />
              </div>

              <button
                onClick={() => setSearchQuery('')}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 text-gray-300 hover:bg-slate-700 transition-colors text-sm"
              >
                Clear Search
              </button>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-gray-400">Loading hotels...</div>
              </div>
            ) : error ? (
              <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400">
                {error}
              </div>
            ) : filteredHotels.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">No hotels found matching your criteria</div>
                <p className="text-gray-500 mt-2">Try adjusting your search</p>
              </div>
            ) : (
              <>
                <div className="mb-6 text-gray-400">
                  Found {filteredHotels.length} {filteredHotels.length === 1 ? 'hotel' : 'hotels'}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {filteredHotels.map((hotel) => (
                    <Link
                      key={hotel.id}
                      href={`/hotels/${hotel.id}`}
                      className="cursor-pointer group"
                    >
                      <motion.div
                        variants={staggerItem}
                        className="rounded-xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/40 to-slate-900/20 backdrop-blur overflow-hidden hover:border-cyan-400 transition-all duration-300 h-full flex flex-col min-h-[30rem] sm:min-h-96"
                      >
                        <div className="relative h-40 overflow-hidden">
                          {hotel.images.length > 0 ? (
                            <img
                              src={hotel.images[0]}
                              alt={hotel.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">No image</span>
                            </div>
                          )}
                          {hotel.starRating && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500/20 border border-amber-500/50 text-amber-400 text-[10px] font-bold rounded-full">
                              {hotel.starRating}★
                            </div>
                          )}
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                              {hotel.name}
                            </h3>
                            <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                              Hotel
                            </span>
                          </div>
                          <p className="text-gray-400 text-[11px] mb-3">📍 {hotel.location}</p>

                          {hotel.description && (
                            <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                              {hotel.description}
                            </p>
                          )}

                          {hotel.amenities.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2">
                              {hotel.amenities.slice(0, 3).map((amenity) => (
                                <span key={amenity} className="text-[10px] px-2 py-1 rounded bg-cyan-500/10 text-cyan-300">
                                  {amenity}
                                </span>
                              ))}
                              {hotel.amenities.length > 3 && (
                                <span className="text-[10px] px-2 py-1 text-gray-400">
                                  +{hotel.amenities.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex-1" />

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 mt-4 border-t border-slate-700">
                            <div className="text-sm text-gray-400">
                              <span className="text-cyan-400 font-bold">
                                {(hotel._count?.properties || 0)}+ Rooms
                              </span>
                            </div>
                            <button className="px-3 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-xs font-semibold w-full sm:w-auto whitespace-nowrap">
                              View Hotel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
      <Footer />
    </main>
  );
}