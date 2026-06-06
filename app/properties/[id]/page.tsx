'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ApplicationForm } from '@/components/ApplicationForm';

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

function ExistingRequestBanner({ request }: { request: any }) {
  const statusConfig: Record<string, { bg: string; border: string; text: string; label: string; subtext: string }> = {
    pending_payment: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      label: 'Payment Pending',
      subtext: 'Complete payment to submit your application',
    },
    pending: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      label: 'Application Submitted',
      subtext: 'We are reviewing your application and will contact the landlord',
    },
    approved: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      label: 'Approved',
      subtext: 'The landlord has approved your application!',
    },
    declined: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      label: 'Declined',
      subtext: 'Unfortunately, the landlord declined your application',
    },
    cancelled: {
      bg: 'bg-gray-500/10',
      border: 'border-gray-500/30',
      text: 'text-gray-400',
      label: 'Cancelled',
      subtext: 'This application has been cancelled',
    },
  };

  const config = statusConfig[request.status] || statusConfig.pending;

  return (
    <motion.div
      variants={staggerItem}
      className={`p-6 rounded-2xl ${config.bg} border ${config.border} space-y-4`}
    >
      <div className={`text-lg font-bold ${config.text}`}>{config.label}</div>
      <p className="text-gray-300 text-sm">{config.subtext}</p>
      {request.message && (
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
          <p className="text-xs text-gray-500 mb-1">Your message</p>
          <p className="text-gray-300 text-sm italic">&quot;{request.message}&quot;</p>
        </div>
      )}
      <div className="text-xs text-gray-500">
        Submitted {new Date(request.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>
    </motion.div>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [checkingRequest, setCheckingRequest] = useState(true);
  const [applicationFee, setApplicationFee] = useState<number>(10);
  const [loadingFee, setLoadingFee] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${propertyId}`);
        if (!response.ok) throw new Error('Failed to fetch property');

        const prop = await response.json();

        if (!prop || prop.error) {
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

  useEffect(() => {
    const fetchFee = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings?.applicationFee) {
            setApplicationFee(data.settings.applicationFee);
          }
        }
      } catch { /* keep default */ }
      finally {
        setLoadingFee(false);
      }
    };
    fetchFee();
  }, []);

  useEffect(() => {
    const checkExistingRequest = async () => {
      if (!propertyId) return;
      try {
        const response = await fetch(`/api/property-requests?propertyId=${propertyId}`, {
          cache: 'no-store',
        });
        if (response.ok) {
          const requests = await response.json();
          const realRequest = requests.find((r: any) => r.status !== 'pending_payment') || null;
          setExistingRequest(realRequest);
        }
      } catch {
        // silently ignore
      } finally {
        setCheckingRequest(false);
      }
    };
    if (propertyId) checkExistingRequest();
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
        <motion.div variants={staggerItem} className="mb-8">
          <button
            type="button"
            onClick={() => router.push('/marketplace')}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
          >
            <span aria-hidden>←</span>
            Back to Marketplace
          </button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div variants={staggerItem} className="md:col-span-2 space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 h-96 bg-slate-900">
              {property.images.length > 0 && (
                <>
                  <img
                    src={property.images[selectedImageIndex]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
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
                <div className="text-sm text-gray-400">/month</div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">About this property</h2>
              <p className="text-gray-300 leading-relaxed">{property.description}</p>
            </div>

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

          <motion.div variants={staggerItem}>
            {checkingRequest ? (
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center">
                <div className="text-gray-400"> Checking application status...</div>
              </div>
            ) : existingRequest ? (
              <ExistingRequestBanner request={existingRequest} />
            ) : (
              <ApplicationForm
                propertyId={propertyId}
                propertyTitle={property.title}
                applicationFee={applicationFee}
              />
            )}
          </motion.div>
        </div>
      </motion.div>
      <Footer />
    </main>
  );
}
