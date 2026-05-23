'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { PremiumButton } from '@/components/PremiumButton';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { DashboardNav } from '@/components/DashboardNav';
import { Footer } from '@/components/Footer';

interface Favorite {
  id: string;
  createdAt: string;
  property: {
    id: string;
    title: string;
    location: string;
    price: number;
    images: string[];
    bedrooms: number;
    bathrooms: number;
    verified: boolean;
    _count: {
      reviews: number;
    };
  };
}

export default function TenantFavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/favorites');
      if (!response.ok) throw new Error('Failed to fetch favorites');
      const data = await response.json();
      setFavorites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/favorites?propertyId=${propertyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove from favorites');

      setFavorites((prev) =>
        prev.filter((fav) => fav.property.id !== propertyId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove favorite');
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <DashboardNav role="tenant" />

      <div className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/dashboard/tenant">
                <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                  ← Back to Dashboard
                </button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Saved Properties
            </h1>
            <p className="text-gray-400">
              {favorites.length} properties saved to your favorites
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400">
              {error}
            </div>
          )}

          {/* Favorites Grid */}
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">
              Loading your favorites...
            </div>
          ) : favorites.length === 0 ? (
            <GlassmorphicCard>
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg mb-4">
                  You haven't saved any properties yet
                </p>
                <Link href="/marketplace">
                  <PremiumButton variant="solid">Browse Properties</PremiumButton>
                </Link>
              </div>
            </GlassmorphicCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav) => (
                <motion.div
                  key={fav.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassmorphicCard className="h-full flex flex-col">
                    <Link href={`/properties/${fav.property.id}`}>
                      <div className="relative h-48 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-slate-800 to-slate-900">
                        {fav.property.images?.[0] ? (
                          <Image
                            src={fav.property.images[0]}
                            alt={fav.property.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            No Image
                          </div>
                        )}
                      </div>

                      <h3 className="font-bold text-white text-lg mb-1 line-clamp-1">
                        {fav.property.title}
                      </h3>

                      <p className="text-sm text-gray-400 mb-3">
                        {fav.property.location}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                        <span>
                          {fav.property.bedrooms} bed • {fav.property.bathrooms} bath
                        </span>
                        {fav.property._count.reviews > 0 && (
                          <span>{fav.property._count.reviews} reviews</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <p className="text-cyan-400 font-bold">
                          KES {fav.property.price.toLocaleString()}
                          <span className="text-gray-500 font-normal text-sm">
                            {' '}
                            /mo
                          </span>
                        </p>
                        {fav.property.verified && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400">
                            Verified
                          </span>
                        )}
                      </div>
                    </Link>

                    <button
                      onClick={() => handleRemoveFavorite(fav.property.id)}
                      className="mt-4 w-full px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-semibold"
                    >
                      Remove from Favorites
                    </button>
                  </GlassmorphicCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}