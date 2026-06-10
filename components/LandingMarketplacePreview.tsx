'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Property } from '@/components/types'



type PropertyType = Property['type']

export function LandingMarketplacePreview() {
  const [properties, setProperties] = React.useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = React.useState<Property[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // compact filters for above-the-fold
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedType, setSelectedType] = React.useState<string>('all')
  const [minPrice, setMinPrice] = React.useState('')
  const [maxPrice, setMaxPrice] = React.useState('')
  const [verifiedOnly, setVerifiedOnly] = React.useState(true)

  React.useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/properties')
        const payload: any = await response.json().catch(() => null)
        if (!response.ok) throw new Error(payload?.error || `Server error (${response.status})`)

        const data = payload as Property[]
        setProperties(data)
        setFilteredProperties(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load properties')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperties()
  }, [])

  React.useEffect(() => {
    let filtered = properties

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) => p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
      )
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((p) => p.type === selectedType)
    }

    if (minPrice) {
      filtered = filtered.filter((p) => p.price >= parseFloat(minPrice))
    }

    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice))
    }

    if (verifiedOnly) {
      filtered = filtered.filter((p) => p.verified)
    }

    setFilteredProperties(filtered)
  }, [
    properties,
    searchQuery,
    selectedType,
    minPrice,
    maxPrice,
    verifiedOnly,
  ])

  const propertyTypes: string[] = ['apartment', 'house', 'studio', 'penthouse']
  const results = filteredProperties.slice(0, 6)

  return (
    <section className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-10 -mt-10">
        <div className="rounded-3xl border border-cyan-400/10 bg-slate-950/40 backdrop-blur-xl p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
            <div>
              <h2 className="text-white text-xl sm:text-2xl font-bold">Browse live properties</h2>
              <p className="text-gray-400 text-sm mt-1">Search and filter instantly — no waiting.</p>
            </div>
            <Link
              href="/marketplace"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold whitespace-nowrap"
            >
              View all
            </Link>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-5"
          >
            <input
              type="text"
              placeholder="Search Nairobi, title…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900/40 border border-slate-800 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900/40 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 transition-colors"
            >
              <option value="all">All Types</option>
              {propertyTypes.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 px-3 py-2 rounded-xl bg-slate-900/40 border border-slate-800 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 px-3 py-2 rounded-xl bg-slate-900/40 border border-slate-800 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <label className="flex items-center gap-2 px-2">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900/40 border-slate-800 text-cyan-400"
              />
              <span className="text-sm text-gray-300">Verified only</span>
            </label>
          </motion.div>

          {/* Results */}
          <div className="mt-6">
            {isLoading ? (
              <div className="py-10 text-center text-gray-400">Loading properties…</div>
            ) : error ? (
              <div className="py-10 text-center text-red-300">{error}</div>
            ) : results.length === 0 ? (
              <div className="py-10 text-center text-gray-400">No matches. Try a different filter.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((p) => (
                  <motion.div
                    key={p.id}
                    whileHover={{ y: -3 }}
                    className="rounded-2xl border border-cyan-400/10 bg-slate-900/20 overflow-hidden"
                  >
                    <Link href={`/properties/${p.id}`} className="block">
                      <div className="relative h-40 bg-slate-800/40">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                        ) : null}
                        {p.verified && (
                          <div className="absolute top-3 right-3 px-2.5 py-1 bg-green-500/20 border border-green-500/40 text-green-300 text-[11px] rounded-full font-bold">
                            Verified
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="text-white font-bold leading-tight">{p.title}</div>
                        <div className="text-gray-400 text-sm mt-1">📍 {p.location}</div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-cyan-300 font-bold">
                            KES {p.price.toLocaleString()}
                            <span className="text-gray-500 font-semibold text-xs">/mo</span>
                          </div>
                          <div className="text-gray-300 text-xs">{p.type}</div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

