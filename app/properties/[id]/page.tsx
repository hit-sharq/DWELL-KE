'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookingForm } from '@/components/BookingForm';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  verified: boolean;
  landlord: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [bookingCreated, setBookingCreated] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties?id=${propertyId}`);
        if (!response.ok) throw new Error('Failed to fetch property');

        const properties = await response.json();
        const prop = properties.find((p: Property) => p.id === propertyId);

        if (!prop) {
          setError('Property not found');
          return;
        }

        setProperty(prop);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load property'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading property...</div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="text-white text-xl">{error || 'Property not found'}</div>
        <Link href="/marketplace">
          <button className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
            Back to Marketplace
          </button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <Navigation />
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 py-8"
      >
        {/* Header Navigation */}
        <motion.div variants={staggerItem} className="mb-8">
          <Link href="/marketplace">
            <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
              <span>←</span>
              Back to Marketplace
            </button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Property Images and Info */}
          <motion.div variants={staggerItem} className="md:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 h-96 bg-slate-900">
              {property.images.length > 0 && (
                <>
                  <img
                    src={property.images[selectedImageIndex]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Navigation */}
                  {property.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedImageIndex((prev) =>
                            prev === 0 ? property.images.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() =>
                          setSelectedImageIndex((prev) =>
                            prev === property.images.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      >
                        ›
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {property.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-cyan-400'
                        : 'border-slate-700 hover:border-cyan-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Property Title and Badge */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{property.title}</h1>
                {property.verified && (
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-bold rounded-full">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-lg">📍 {property.location}</p>
            </div>

            {/* Property Stats */}
            <div className="grid grid-cols-4 gap-4 p-6 rounded-xl bg-slate-900/50 border border-slate-800">
              <div>
                <div className="text-2xl font-bold text-cyan-400">
                  {property.bedrooms}
                </div>
                <div className="text-sm text-gray-400">Bedrooms</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-400">
                  {property.bathrooms}
                </div>
                <div className="text-sm text-gray-400">Bathrooms</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-400">
                  {property.type.charAt(0).toUpperCase() +
                    property.type.slice(1)}
                </div>
                <div className="text-sm text-gray-400">Type</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-400">
                  KES {property.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">/Night</div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">About this property</h2>
              <p className="text-gray-300 leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm font-medium"
                    >
                      ✓ {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Landlord Info */}
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-3">About the landlord</h3>
              <div className="flex items-center gap-4">
                {property.landlord.profileImage && (
                  <img
                    src={property.landlord.profileImage}
                    alt={property.landlord.firstName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                )}
                <div>
                  <div className="font-semibold text-white">
                    {property.landlord.firstName} {property.landlord.lastName}
                  </div>
                  <div className="text-sm text-gray-400">Property Owner</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Booking Form Sidebar */}
          <motion.div variants={staggerItem}>
            {!bookingCreated ? (
              <BookingForm
                propertyId={propertyId}
                pricePerNight={property.price}
                onBookingCreated={(booking) => {
                  setBookingCreated(true);
                  // Optionally redirect to payment page
                  router.push(
                    `/checkout?bookingId=${booking.id}&totalPrice=${booking.totalPrice}`
                  );
                }}
              />
            ) : (
              <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/30 text-center">
                <div className="text-green-400 text-lg font-bold mb-4">
                  Booking Created!
                </div>
                <p className="text-gray-300 mb-4">
                  Redirecting to payment...
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
      <Footer />
    </main>
  );
}
