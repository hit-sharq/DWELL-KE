'use client';

import React, { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { scrollReveal } from '@/lib/animations';

interface PropertyDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number | null;
  amenities: string[];
  images:  string[];
  verified: boolean;
  featured: boolean;
  type: string;
  status: string;
  createdAt: string;
  landlord:
    | { firstName: string; lastName: string; email: string; phoneNumber?: string | null; profileImage: string | null }
    | null;
  reviews: Array<{ id: string; rating: number; comment: string; author: { firstName: string; lastName: string } }>;
  _count?: { bookings?: number; favorites?: number; reviews?: number };
}

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [property, setProperty]   = useState<PropertyDetail | null>(null);
  const [mainImage, setMainImage] = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/properties/${id}`);
        if (res.status === 404) { setError('Property not found'); setLoading(false); return; }
        if (!res.ok) throw new Error('Failed to fetch property');
        const data: PropertyDetail = await res.json();
        setProperty(data);
        setMainImage(data.images?.[0] || '');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error loading property');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-32">
              <div className="inline-block animate-spin rounded-full h-14 w-14 border-b-2 border-cyan-400" />
              <p className="text-gray-400 mt-6">Loading property…</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="@apply text-center py-32">
              <h1 className="text-3xl font-bold text-white mb-4">Property Not Found</h1>
              <p className="text-gray-400">{error || 'This property does not exist or has been removed.'}</p>
              <Link href="/marketplace">
                <PremiumButton variant="solid" size="lg" className="mt-8">
                  Browse Available Properties
                </PremiumButton>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const landlordName = property.landlord
    ? `${property.landlord.firstName} ${property.landlord.lastName}`
    : 'Unknown Landlord';

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Back button */}
          <Link href="/marketplace">
            <motion.div {...scrollReveal} className="mb-8 inline-block">
              <PremiumButton variant="outline" size="sm">← Back to Marketplace</PremiumButton>
            </motion.div>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">

              {/* Image Gallery */}
              <motion.div {...scrollReveal}>
                <GlassmorphicCard className="overflow-hidden">
                  <div className="relative w-full h-96 mb-4 rounded-xl overflow-hidden bg-slate-800">
                    {mainImage ? (
                      <img src={mainImage} alt={property.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        No Image Available
                      </div>
                    )}
                    {property.verified && (
                      <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold font-mono bg-emerald-500/25 text-emerald-300 backdrop-blur-sm border border-emerald-400/30">
                        ✓ Verified
                      </span>
                    )}
                    {property.featured && (
                      <span className="absolute top-4 left-24 px-3 py-1.5 rounded-full text-xs font-semibold font-mono bg-cyan-500/25 text-cyan-300 backdrop-blur-sm border border-cyan-400/30">
                        ★ Featured
                      </span>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {property.images.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {property.images.map((image, idx) => (
                        <button
                          key={idx}
                          onClick={() => setMainImage(image)}
                          className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                            mainImage === image
                              ? 'border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.35)]'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={image} alt={`${property.title} view ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </GlassmorphicCard>
              </motion.div>

              {/* Property Details */}
              <motion.div {...scrollReveal}>
                <GlassmorphicCard>
                  <h1 className="text-3xl font-bold text-white mb-2">{property.title}</h1>
                  <p className="text-cyan-400/80 text-lg mb-6">{property.location}</p>

                  <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-slate-700/50">
                    <div className="text-center p-5 rounded-xl bg-slate-900/40">
                      <p className="text-3xl font-bold text-white">{property.bedrooms}</p>
                      <p className="text-gray-500 text-sm mt-1">Bedrooms</p>
                    </div>
                    <div className="text-center p-5 rounded-xl bg-slate-900/40">
                      <p className="text-3xl font-bold text-white">{property.bathrooms}</p>
                      <p className="text-gray-500 text-sm mt-1">Bathrooms</p>
                    </div>
                    <div className="text-center p-5 rounded-xl bg-slate-900/40">
                      <p className="text-3xl font-bold text-white">{property.area?.toLocaleString() ?? '—'}</p>
                      <p className="text-gray-500 text-sm mt-1">sqm</p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">About this property</h2>
                    <p className="text-gray-400 leading-relaxed">{(property.description || '').trim()}</p>
                  </div>
                </GlassmorphicCard>
              </motion.div>

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <motion.div {...scrollReveal}>
                  <GlassmorphicCard>
                    <h2 className="text-xl font-bold text-white mb-6">Amenities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {property.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/8 border border-blue-500/15">
                          <span className="text-lg text-cyan-400">✓</span>
                          <span className="text-white font-medium">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </GlassmorphicCard>
                </motion.div>
              )}

              {/* Reviews */}
              {property.reviews.length > 0 && (
                <motion.div {...scrollReveal}>
                  <GlassmorphicCard>
                    <h2 className="text-xl font-bold text-white mb-6">
                      Reviews ({property.reviews.length})
                    </h2>
                    <div className="space-y-4">
                      {property.reviews.map((review) => (
                        <div key={review.id} className="p-4 rounded-xl bg-slate-900/40">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-yellow-400 font-medium">{'★'.repeat(review.rating)}</span>
                            <span className="text-gray-500 text-sm">
                              {review.author.firstName} {review.author.lastName}
                            </span>
                          </div>
                          {review.comment && <p className="text-gray-400 text-sm">{review.comment}</p>}
                        </div>
                      ))}
                    </div>
                  </GlassmorphicCard>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <motion.div {...scrollReveal} className="lg:col-span-1">
              {/* Price Card */}
              <GlassmorphicCard className="sticky top-24 mb-6">
                <div className="mb-6">
                  <p className="text-gray-500 text-sm mb-1.5">Monthly Price</p>
                  <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                    KES {property.price.toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">per month</p>
                </div>

                {property.verified && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-emerald-400 font-bold text-sm">✓ Verified Property</p>
                  </div>
                )}

                {property._count && (
                  <div className="mb-6 flex items-center gap-4 text-sm text-gray-400">
                    <span>⭐ {property._count.reviews || 0} reviews</span>
                    <span>📅 {property._count.bookings || 0} bookings</span>
                  </div>
                )}

                <PremiumButton variant="solid" size="lg" className="w-full mb-3">
                  Request Viewing
                </PremiumButton>
                <PremiumButton variant="outline" size="lg" className="w-full">
                  Add to Favorites
                </PremiumButton>
              </GlassmorphicCard>

              {/* Landlord Card */}
              {property.landlord && (
                <GlassmorphicCard className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-4">Landlord</h3>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg">
                      {property.landlord.firstName[0]}
                    </div>
                    <div>
                      <p className="text-white font-bold">{landlordName}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {property.landlord.email}
                        {property.landlord.phoneNumber && ` · ${property.landlord.phoneNumber}`}
                      </p>
                    </div>
                  </div>
                  <PremiumButton variant="outline" size="sm" className="w-full">
                    Contact Landlord
                  </PremiumButton>
                </GlassmorphicCard>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
