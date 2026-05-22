'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { scrollReveal } from '@/lib/animations';

// Mock property details
const propertyDetails: Record<
  number,
  {
    title: string;
    price: number;
    location: string;
    beds: number;
    baths: number;
    size: number;
    images: string[];
    verified: boolean;
    amenities: string[];
    description: string;
    landlord: string;
  }
> = {
  1: {
    title: 'Luxury Modern Apartment',
    price: 45000,
    location: 'Westlands, Nairobi',
    beds: 3,
    baths: 2,
    size: 250,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    ],
    verified: true,
    amenities: ['WiFi', 'Parking', 'Gym', 'Security', 'Air Conditioning'],
    description:
      'Stunning luxury apartment in the heart of Westlands with modern finishes, spacious living areas, and world-class amenities. Perfect for professionals and families.',
    landlord: 'John Property Management',
  },
};

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = parseInt(params.id as string) || 1;
  const property = propertyDetails[propertyId] || propertyDetails[1];
  const [mainImage, setMainImage] = React.useState(property.images[0]);

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <Link href="/marketplace">
            <motion.div
              {...scrollReveal}
              className="mb-8 inline-block"
            >
              <PremiumButton variant="outline" size="sm">
                ← Back to Marketplace
              </PremiumButton>
            </motion.div>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <motion.div {...scrollReveal}>
                <GlassmorphicCard className="overflow-hidden">
                  <div className="relative w-full h-96 mb-4 rounded-lg overflow-hidden bg-slate-700">
                    <img
                      src={mainImage}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {property.images.map((image, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMainImage(image)}
                        className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 border-transparent hover:border-cyan-400 transition-colors"
                      >
                        <img
                          src={image}
                          alt={`View ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </GlassmorphicCard>
              </motion.div>

              {/* Property Details */}
              <motion.div {...scrollReveal}>
                <GlassmorphicCard>
                  <h1 className="text-3xl font-bold text-white mb-4">
                    {property.title}
                  </h1>
                  <p className="text-cyan-400 text-lg mb-6">{property.location}</p>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-slate-700">
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {property.beds}
                      </p>
                      <p className="text-gray-400 text-sm">Bedrooms</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {property.baths}
                      </p>
                      <p className="text-gray-400 text-sm">Bathrooms</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {property.size}
                      </p>
                      <p className="text-gray-400 text-sm">sqm</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">
                      About this property
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                      {property.description}
                    </p>
                  </div>
                </GlassmorphicCard>
              </motion.div>

              {/* Amenities */}
              <motion.div {...scrollReveal}>
                <GlassmorphicCard>
                  <h2 className="text-xl font-bold text-white mb-6">
                    Amenities
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
                      >
                        <span className="text-2xl">✓</span>
                        <span className="text-white font-medium">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </GlassmorphicCard>
              </motion.div>
            </div>

            {/* Sidebar */}
            <motion.div
              {...scrollReveal}
              className="lg:col-span-1"
            >
              {/* Price Card */}
              <GlassmorphicCard className="sticky top-24 mb-6">
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-2">Monthly Price</p>
                  <p className="text-4xl font-bold text-cyan-400">
                    KES {property.price.toLocaleString()}
                  </p>
                </div>

                {property.verified && (
                  <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-emerald-400 font-bold text-sm">
                      ✓ Verified Property
                    </p>
                  </div>
                )}

                <PremiumButton variant="solid" size="lg" className="w-full mb-3">
                  Request Viewing
                </PremiumButton>
                <PremiumButton variant="outline" size="lg" className="w-full">
                  Add to Favorites
                </PremiumButton>
              </GlassmorphicCard>

              {/* Landlord Info */}
              <GlassmorphicCard>
                <h3 className="text-lg font-bold text-white mb-4">
                  Landlord Information
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400" />
                  <div>
                    <p className="text-white font-bold">{property.landlord}</p>
                    <p className="text-gray-400 text-sm">✓ Verified</p>
                  </div>
                </div>
                <PremiumButton variant="outline" size="sm" className="w-full">
                  Contact Landlord
                </PremiumButton>
              </GlassmorphicCard>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
