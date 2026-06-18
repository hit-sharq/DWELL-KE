'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import ErrorAlert from '@/components/ErrorAlert';

interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  listingType: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  verified: boolean;
  landlord: {
    firstName: string;
    lastName: string;
  };
}

export default function MarketplacePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedListingType, setSelectedListingType] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBedrooms, setMinBedrooms] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/properties');
        const payload: any = await response.json().catch(() => null);
        if (!response.ok) throw new Error(payload?.error || `Server error (${response.status})`);
        setProperties(payload);
        setFilteredProperties(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load properties');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const listingTypes = ['rental', 'hotel'];

  const formatListingType = (listingType: string) =>
    listingType === 'hotel' ? 'Hotel' : 'Rental';

  useEffect(() => {
    let filtered = properties;
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedType !== 'all') filtered = filtered.filter((p) => p.type === selectedType);
    if (selectedListingType !== 'all') filtered = filtered.filter((p) => p.listingType === selectedListingType);
    if (minPrice) filtered = filtered.filter((p) => p.price >= parseFloat(minPrice));
    if (maxPrice) filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice));
    if (minBedrooms) filtered = filtered.filter((p) => p.bedrooms >= parseInt(minBedrooms, 10));
    if (verifiedOnly) filtered = filtered.filter((p) => p.verified);
    setFilteredProperties(filtered);
  }, [properties, searchQuery, selectedType, selectedListingType, minPrice, maxPrice, minBedrooms, verifiedOnly]);

  const propertyTypes = ['apartment', 'house', 'studio', 'penthouse'];

  const formatPropertyType = (type: string) => {
    const abbreviations: { [key: string]: string } = {
      apartment: 'Apt',
      penthouse: 'Pent',
      house: 'House',
      studio: 'Studio',
    };
    return abbreviations[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <Navigation />
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 pt-24 pb-12"
      >
        {/* Hero Header */}
        <motion.div variants={staggerItem} className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-2 glass-strong px-4 py-1.5 rounded-full border-cyan-400/12 shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400/70" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] font-mono">
                <span className="text-cyan-300">Premium</span>
                <span className="text-white/90">Properties</span>
              </span>
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your Perfect Property
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Browse our premium collection of verified properties across Kenya — from Nairobi rooftops to Mombasa coastlines
          </p>
          <div className="h-px bg-gradient-to-r from-cyan-400/80 via-blue-500/50 to-transparent mt-6 mb-8" style={{ maxWidth: 480 }} />
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <motion.div variants={staggerItem} className="lg:col-span-1">
            <div className="sticky top-8 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/40 to-slate-900/20 backdrop-blur p-5 space-y-5">
              <div>
                <h3 className="font-bold text-white mb-3">Filters</h3>
              </div>

              {/* Search */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Search Location
                </label>
                <input
                  type="text"
                  placeholder="Search by location or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all text-sm"
                />
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Property Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 transition-all text-sm"
                >
                  <option value="all">All Types</option>
                  {propertyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Price Range (KES)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Minimum Bedrooms
                </label>
                <select
                  value={minBedrooms}
                  onChange={(e) => setMinBedrooms(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 transition-all text-sm"
                >
                  <option value="">Any</option>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num}+ Bedrooms
                    </option>
                  ))}
                </select>
              </div>

              {/* Listing Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Listing Type
                </label>
                <select
                  value={selectedListingType}
                  onChange={(e) => setSelectedListingType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 transition-all text-sm"
                >
                  <option value="all">All Listings</option>
                  {listingTypes.map((listingType) => (
                    <option key={listingType} value={listingType}>
                      {formatListingType(listingType)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Verified Only */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="verified"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 cursor-pointer"
                />
                <label htmlFor="verified" className="text-xs text-gray-300 cursor-pointer">
                  Verified Properties Only
                </label>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setMinPrice('');
                  setMaxPrice('');
                  setMinBedrooms('');
                  setVerifiedOnly(false);
                }}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 text-gray-300 hover:bg-slate-700 transition-colors text-sm"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>

          {/* Main Content - Property Grid */}
          <motion.div variants={staggerItem} className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-gray-400">Loading properties...</div>
              </div>
            ) : error ? (
              <ErrorAlert message={error} />
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">No properties found matching your criteria</div>
                <p className="text-gray-500 mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="mb-6 text-gray-400">
                  Found {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {filteredProperties.map((property) => (
                    <Link
                      key={property.id}
                      href={`/properties/${property.id}`}
                      onClick={() => setActivePropertyId(property.id)}
                    >
                      <motion.div
                        variants={staggerItem}
                        className="cursor-pointer group"
                      >
                        <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/40 to-slate-900/20 backdrop-blur overflow-hidden hover:border-cyan-400 transition-all duration-300 h-full flex flex-col min-h-[30rem] sm:min-h-96">
                          <div className="relative h-40 overflow-hidden">
                            {property.images.length > 0 ? (
                              <img
                                src={property.images[0]}
                                alt={property.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">No image</span>
                              </div>
                            )}
                            {property.verified && (
                              <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-500/20 border border-green-500/50 text-green-400 text-[10px] font-bold rounded-full">
                                Verified
                              </div>
                            )}
                          </div>

                          <div className="p-4 flex-1 flex flex-col">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                                {property.title}
                              </h3>
                              <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                                {formatListingType(property.listingType)}
                              </span>
                            </div>
                            <p className="text-gray-400 text-[11px] mb-3">📍 {property.location}</p>

                            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                              <div className="text-xs text-gray-400 min-w-0">
                                <div className="text-lg font-bold text-cyan-400 truncate">{property.bedrooms}</div>
                                <div className="text-[10px] truncate">Bedrooms</div>
                              </div>
                              <div className="text-xs text-gray-400 min-w-0">
                                <div className="text-lg font-bold text-cyan-400 truncate">{property.bathrooms}</div>
                                <div className="text-[10px] truncate">Bathrooms</div>
                              </div>
                              <div className="text-xs text-gray-400 min-w-0">
                                <div className="text-lg font-bold text-cyan-400 truncate">{formatPropertyType(property.type)}</div>
                                <div className="text-[10px] truncate">Type</div>
                              </div>
                            </div>

                            {property.amenities.length > 0 && (
                              <div className="mb-3 flex flex-wrap gap-2">
                                {property.amenities.slice(0, 2).map((amenity) => (
                                  <span key={amenity} className="text-[10px] px-2 py-1 rounded bg-cyan-500/10 text-cyan-300">
                                    {amenity}
                                  </span>
                                ))}
                                {property.amenities.length > 2 && (
                                  <span className="text-[10px] px-2 py-1 text-gray-400">
                                    +{property.amenities.length - 2}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="flex-1" />

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 mt-4 border-t border-slate-700">
                              <div className="text-sm sm:text-base font-bold text-cyan-400">
                                KES {property.price.toLocaleString()}
                                 <span className="text-[9px] sm:text-[10px] text-gray-500 block sm:inline">
                                   /{property.listingType === 'hotel' ? 'night' : 'month'}
                                 </span>
                              </div>
                              <button
                                className="px-3 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-xs font-semibold disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto whitespace-nowrap"
                                disabled={activePropertyId === property.id}
                              >
                                {activePropertyId === property.id ? 'Loading…' : 'View Details'}
                              </button>
                            </div>
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
