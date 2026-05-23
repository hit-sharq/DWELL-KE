'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface Booking {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: string;
  specialRequests?: string;
  tenant: {
    firstName: string;
    lastName: string;
  };
  property: {
    id: string;
    title: string;
    images: string[];
  };
  payment?: {
    status: string;
  };
}

interface Property {
  id: string;
  title: string;
}

export default function LandlordBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/properties');
      if (!response.ok) throw new Error('Failed to fetch properties');

      const propsData = await response.json();
      setProperties(propsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const getPropertyBookings = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/bookings?propertyId=${propertyId}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    }
  };

  useEffect(() => {
    if (selectedProperty && selectedProperty !== 'all') {
      getPropertyBookings(selectedProperty);
    }
  }, [selectedProperty]);

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      setUpdatingId(bookingId);
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: 'confirmed' }),
      });

      if (!response.ok) throw new Error('Failed to confirm booking');

      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'confirmed' } : b
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm booking');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to reject this booking?')) return;

    try {
      setUpdatingId(bookingId);
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status: 'cancelled' }),
      });

      if (!response.ok) throw new Error('Failed to reject booking');

      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject booking');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) =>
    filter === 'all' ? true : b.status === filter
  );

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    confirmed: 'bg-green-500/20 border-green-500/50 text-green-400',
    completed: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
    cancelled: 'bg-red-500/20 border-red-500/50 text-red-400',
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 py-12"
      >
        {/* Header */}
        <motion.div variants={staggerItem} className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard/landlord">
              <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                <span>←</span>
                Back to Dashboard
              </button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-white">Manage Bookings</h1>
        </motion.div>

        {/* Property Selection */}
        <motion.div variants={staggerItem} className="mb-8 p-6 rounded-xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/40 to-slate-900/20 backdrop-blur">
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Select Property
          </label>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 transition-all"
          >
            <option value="all">Choose a property to view bookings</option>
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.title}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Filter Tabs */}
        {selectedProperty !== 'all' && (
          <motion.div variants={staggerItem} className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm font-semibold ${
                  filter === f
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            variants={staggerItem}
            className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Bookings List */}
        {isLoading ? (
          <motion.div variants={staggerItem} className="text-center py-12">
            <div className="text-gray-400">Loading bookings...</div>
          </motion.div>
        ) : selectedProperty === 'all' ? (
          <motion.div
            variants={staggerItem}
            className="text-center py-12 rounded-xl border border-slate-800 bg-slate-900/30"
          >
            <div className="text-gray-400">Select a property to view its bookings</div>
          </motion.div>
        ) : filteredBookings.length === 0 ? (
          <motion.div
            variants={staggerItem}
            className="text-center py-12 rounded-xl border border-slate-800 bg-slate-900/30"
          >
            <div className="text-gray-400">No {filter !== 'all' ? filter : ''} bookings</div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking.id}
                variants={staggerItem}
                className="rounded-xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/40 to-slate-900/20 backdrop-blur overflow-hidden hover:border-cyan-400 transition-all"
              >
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  {/* Property Image */}
                  {booking.property.images.length > 0 && (
                    <div className="md:w-40 h-40 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={booking.property.images[0]}
                        alt={booking.property.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Booking Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {booking.tenant.firstName} {booking.tenant.lastName}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Booking for {booking.property.title}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[booking.status] || statusColors.pending}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </div>
                    </div>

                    {/* Dates and Guests */}
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Check-in</div>
                        <div>{format(new Date(booking.checkInDate), 'PPP')}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Check-out</div>
                        <div>{format(new Date(booking.checkOutDate), 'PPP')}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Total Amount</div>
                        <div className="text-cyan-400 font-semibold">
                          KES {booking.totalPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {booking.specialRequests && (
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm">
                        <span className="font-semibold">Special Requests:</span> {booking.specialRequests}
                      </div>
                    )}

                    {/* Payment Status */}
                    {booking.payment && (
                      <div className="text-xs text-gray-500">
                        Payment Status:{' '}
                        <span className={`font-semibold ${
                          booking.payment.status === 'completed'
                            ? 'text-green-400'
                            : 'text-yellow-400'
                        }`}>
                          {booking.payment.status.charAt(0).toUpperCase() + booking.payment.status.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 md:w-32 justify-start">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleConfirmBooking(booking.id)}
                          disabled={updatingId === booking.id}
                          className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-semibold disabled:opacity-50"
                        >
                          {updatingId === booking.id ? 'Confirming...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => handleRejectBooking(booking.id)}
                          disabled={updatingId === booking.id}
                          className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-semibold disabled:opacity-50"
                        >
                          {updatingId === booking.id ? 'Rejecting...' : 'Reject'}
                        </button>
                      </>
                    )}

                    {booking.status === 'confirmed' && (
                      <>
                        <button className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-semibold">
                          Message Guest
                        </button>
                        <button
                          onClick={() => handleRejectBooking(booking.id)}
                          disabled={updatingId === booking.id}
                          className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-semibold disabled:opacity-50"
                        >
                          Cancel Booking
                        </button>
                      </>
                    )}

                    {booking.status === 'completed' && (
                      <button className="px-4 py-2 bg-slate-800 border border-slate-700 text-gray-400 rounded-lg cursor-default text-sm font-semibold">
                        Completed
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </main>
  );
}
