'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { scrollReveal } from '@/lib/animations';

type PropertyItem = {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  type: string;
  status: string;
  verified: boolean;
  featured: boolean;
  images?: string[];
  landlord: { firstName: string; lastName: string };
  bookingsCount: number;
  reviewsCount: number;
};

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.append('status', statusFilter);
        const res = await fetch(`/api/admin/properties?${params}`);
        if (!res.ok) throw new Error('Failed to fetch properties');
        setProperties(await res.json());
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error fetching properties');
      } finally {
        setLoading(false);
      }
    })();
  }, [statusFilter]);

  const toggleVerified = async (id: string, verified: boolean) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !verified }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, verified: !verified } : p))
      );
    } catch {
      // handled silently — server error logged
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="py-10 px-8">

       {/* ── Header ── */}
       <motion.div {...scrollReveal} className="mb-10">
         <div className="flex items-center gap-3 mb-2">
           <span className="text-4xl font-bold leading-none">🏠</span>
           <h1 className="
             font-serif font-black text-white
             text-[clamp(1.75rem,3.5vw,2.5rem)]
             leading-[0.95] tracking-[-0.025em]
           ">
             Property Listings
           </h1>
         </div>
         <p className="text-gray-400 font-light text-base">
           Review, approve, and manage all property verifications — live data
         </p>
         <div className="mt-4">
           <Link href="/admin/properties/create">
             <PremiumButton variant="solid" size="sm">
               Create Property
             </PremiumButton>
           </Link>
         </div>
       </motion.div>

{/* ── Filters ── */}
       <motion.div
         initial={{ opacity: 0, y: 18 }}
         animate={{ opacity: 1, y: 0 }}
         className="mb-8 flex gap-3 flex-nowrap overflow-x-auto pb-2"
       >
         {(['all', 'verified', 'pending'] as const).map((s) => (
           <button
             key={s}
             onClick={() => setStatusFilter(s)}
             className={`
               px-5 py-2.5 rounded-xl text-[11px] uppercase font-semibold tracking-[0.15em]
               transition-all duration-300
               ${statusFilter === s
                 ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_24px_rgba(34,211,238,0.38)]'
                 : 'bg-slate-900/50 text-gray-400 hover:text-white border border-white/[0.07]'}
             `}
           >
             {s.charAt(0).toUpperCase() + s.slice(1)}
           </button>
         ))}
       </motion.div>

      {error && !loading && (
        <GlassmorphicCard className="border-red-400/20 bg-red-500/5 mb-8">
          <p className="text-red-400 text-sm">{error}</p>
        </GlassmorphicCard>
      )}

      {/* ── Grid ── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-slate-800/20 h-44" />
          ))}
        </div>
      )}

      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {properties.length === 0 ? (
            <GlassmorphicCard className="md:col-span-2 text-center py-16">
              <p className="text-gray-500 text-sm">No properties match this filter.</p>
            </GlassmorphicCard>
          ) : (
            properties.map((p, i) => {
              const llName = `${p.landlord.firstName} ${p.landlord.lastName}`;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px 0px' }}
                  transition={{ delay: i * 0.05, type: 'spring', damping: 22, stiffness: 160 }}
                >
                  <GlassmorphicCard className="group h-full flex flex-col">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white text-lg truncate group-hover:text-cyan-200 transition-colors">
                            {p.title}
                          </h3>
                          {p.featured && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider
                                           bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0">
                              ★ Featured
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{p.location}</p>
                      </div>
                      {p.verified ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider
                                         bg-emerald-500/12 text-emerald-400 border border-emerald-500/18">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider
                                         bg-yellow-500/12 text-yellow-400 border border-yellow-500/18">
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Meta strip */}
                    <div className="flex items-center gap-5 text-xs text-gray-400 mb-4 pb-4 border-b border-white/[0.04]">
                      <span>{p.bedrooms} bed · {p.bathrooms} bath</span>
                      <span className="text-gray-600">|</span>
                      <span className="text-nowrap">{p.type}</span>
                      <span className="text-gray-600">|</span>
                      <span className="text-cyan-400 font-semibold">KES {p.price.toLocaleString()}<span className="text-gray-500 font-normal">/mo</span></span>
                    </div>

                    {/* Landlord row */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/15
                                      border border-cyan-400/10 flex items-center justify-center text-white text-xs font-bold">
                        {p.landlord.firstName?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">{llName}</p>
                        <p className="text-[10px] text-gray-500">{p.bookingsCount} bookings · {p.reviewsCount} reviews</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-auto pt-2 border-t border-white/[0.04]">
                      <Link href={`/properties/${p.id}`} className="flex-1">
                        <PremiumButton variant="ghost" size="sm" className="w-full">
                          View
                        </PremiumButton>
                      </Link>
                      <button
                        onClick={() => toggleVerified(p.id, p.verified)}
                        disabled={updatingId === p.id}
                        className={`
                          flex-1 py-2 px-4 rounded-xl text-[11px] font-semibold uppercase tracking-wider
                          transition-all border
                          ${p.verified
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/18 hover:bg-yellow-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/18 hover:bg-emerald-500/20'
                          }
                          ${updatingId === p.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        {p.verified ? 'Revoke Verification' : 'Approve'}
                      </button>
                    </div>
                  </GlassmorphicCard>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}
    </div>
  );
}
