'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlassmorphicCard } from './GlassmorphicCard';
import { PremiumButton } from './PremiumButton';
import { scrollReveal } from '@/lib/animations';

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  images?: string[];
  amenities?: string[];
  type?: string;
  status?: string;
}

export function PropertyListing() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.location) params.append('location', filters.location);
      if (filters.type) params.append('type', filters.type);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const response = await fetch(`/api/properties?${params}`);
      if (!response.ok) throw new Error('Failed to fetch properties');

      const data = await response.json();
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
      console.error('[PropertyListing] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Filters */}
      <motion.div variants={scrollReveal} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          name="location"
          placeholder="Location..."
          value={filters.location}
          onChange={handleFilterChange}
          className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
        />
        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
          className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
        >
          <option value="">All Types</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="studio">Studio</option>
          <option value="penthouse">Penthouse</option>
        </select>
        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={handleFilterChange}
          className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
        />
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <motion.div variants={scrollReveal} className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
          <p className="text-gray-400 mt-4">Loading properties...</p>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div variants={scrollReveal} className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400">
          {error}
        </motion.div>
      )}

      {/* Properties Grid */}
      {!isLoading && properties.length > 0 && (
        <motion.div
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {properties.map((property) => (
            <motion.div
              key={property.id}
              variants={scrollReveal}
              whileHover={{ y: -8 }}
            >
              <Link href={`/properties/${property.id}`}>
                <GlassmorphicCard className="h-full hover:border-cyan-400/50 transition-all cursor-pointer">
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden mb-4">
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white line-clamp-2">
                      {property.title}
                    </h3>

                    <p className="text-gray-400 text-sm">{property.location}</p>

                    {/* Price */}
                    <div className="pt-2 border-t border-slate-700">
                      <p className="text-2xl font-bold text-cyan-400">
                        KES {property.price.toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-xs">per month</p>
                    </div>

                    {/* Specs */}
                    <div className="flex gap-4 text-sm text-gray-300">
                      <span>🛏️ {property.bedrooms} Bed</span>
                      <span>🚿 {property.bathrooms} Bath</span>
                    </div>

                    {/* Amenities */}
                    {property.amenities && property.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <PremiumButton variant="solid" size="sm" className="w-full">
                      View Details
                    </PremiumButton>
                  </div>
                </GlassmorphicCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && properties.length === 0 && (
        <motion.div variants={scrollReveal} className="text-center py-12">
          <p className="text-gray-400">No properties found matching your filters.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
