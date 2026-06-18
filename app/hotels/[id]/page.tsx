'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PremiumButton } from '@/components/PremiumButton';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface Hotel {
  id: string;
  name: string;
  description: string | null;
  location: string;
  starRating: number | null;
  amenities: string[];
  images: string[];
  featured: boolean;
  properties: Array<{
    id: string;
    title: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    images: string[];
    amenities: string[];
  }>;
}

export default function HotelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        setIsLoading(true);
        const { id } = await params;
        const response = await fetch(`/api/hotels?id=${id}`);
        const payload = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.error || 'Failed to load hotel');
        setHotel(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load hotel');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHotel();
  }, [params]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950">
        <Navigation />
        <div className="container mx-auto px-4 pt-32">
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">Loading hotel...</div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !hotel) {
    return (
      <main className="min-h-screen bg-slate-950">
        <Navigation />
        <div className="container mx-auto px-4 pt-32">
          <div className="text-center py-12">
            <div className="text-red-400 text-lg">{error || 'Hotel not found'}</div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <Navigation />
      
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 pt-24 pb-12"
      >
        <motion.div variants={staggerItem} className="mb-8">
          <Link href="/hotels">
            <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-4">
              ← Back to Hotels
            </button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {hotel.name}
          </h1>
          <p className="text-gray-400 text-lg">📍 {hotel.location}</p>
        </motion.div>

        <motion.div variants={staggerItem} className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hotel.images.length > 0 ? (
              hotel.images.slice(0, 3).map((img, idx) => (
                <div key={idx} className="relative h-64 rounded-xl overflow-hidden">
                  <Image
                    src={img}
                    alt={`${hotel.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="h-64 bg-slate-800 rounded-xl flex items-center justify-center col-span-3">
                <span className="text-gray-500">No images available</span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="mb-12">
          <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/40 to-slate-900/20 backdrop-blur p-8">
            <h2 className="text-2xl font-bold text-white mb-4">About This Hotel</h2>
            <p className="text-gray-300 leading-relaxed">
              {hotel.description || 'No description available for this hotel.'}
            </p>
            
            {hotel.starRating && (
              <div className="mt-6">
                <span className="text-amber-400 font-bold text-lg">★ {hotel.starRating} Star Rating</span>
              </div>
            )}

            {hotel.amenities.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.map((amenity) => (
                    <span key={amenity} className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={staggerItem}>
          <h2 className="text-3xl font-bold text-white mb-6">Available Rooms</h2>
          
          {hotel.properties.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/20 rounded-xl border border-slate-700">
              <p className="text-gray-400">No rooms available at this hotel yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {hotel.properties.map((room) => (
                <motion.div
                  key={room.id}
                  variants={staggerItem}
                  className="rounded-xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/40 to-slate-900/20 backdrop-blur overflow-hidden"
                >
                  <div className="relative h-48">
                    {room.images.length > 0 ? (
                      <Image
                        src={room.images[0]}
                        alt={room.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{room.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">📍 {room.location}</p>

                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-cyan-400">{room.bedrooms}</div>
                        <div className="text-[10px] text-gray-500">Bedrooms</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-cyan-400">{room.bathrooms}</div>
                        <div className="text-[10px] text-gray-500">Bathrooms</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-cyan-400">WiFi</div>
                        <div className="text-[10px] text-gray-500">Internet</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <div className="text-xl font-bold text-cyan-400">
                        KES {room.price.toLocaleString()}
                        <span className="text-[10px] text-gray-500 block">/night</span>
                      </div>
                      <Link href={`/properties/${room.id}`}>
                        <PremiumButton variant="solid" size="sm">
                          Book Now
                        </PremiumButton>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
      <Footer />
    </main>
  );
}