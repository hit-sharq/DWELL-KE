'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DayPicker } from 'react-day-picker';
import { format, differenceInDays } from 'date-fns';
import { PremiumButton } from '@/components/PremiumButton';
import { staggerContainer, staggerItem } from '@/lib/animations';
import 'react-day-picker/dist/style.css';

interface BookingFormProps {
  propertyId: string;
  pricePerNight: number;
  onBookingCreated?: (booking: any) => void;
}

export function BookingForm({
  propertyId,
  pricePerNight,
  onBookingCreated,
}: BookingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const nights =
    checkInDate && checkOutDate
      ? differenceInDays(checkOutDate, checkInDate)
      : 0;
  const totalPrice = nights > 0 ? nights * pricePerNight : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!checkInDate || !checkOutDate) {
      setError('Please select check-in and check-out dates');
      setIsLoading(false);
      return;
    }

    if (nights <= 0) {
      setError('Check-out date must be after check-in date');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate.toISOString(),
          numberOfGuests,
          specialRequests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      setSuccess('Booking created successfully! Proceed to payment.');
      setCheckInDate(undefined);
      setCheckOutDate(undefined);
      setNumberOfGuests(1);
      setSpecialRequests('');

      if (onBookingCreated) {
        onBookingCreated(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6 max-w-xl p-6 rounded-2xl bg-gradient-to-b from-slate-900/40 to-slate-900/20 border border-cyan-500/30 backdrop-blur"
    >
      <h3 className="text-xl font-bold text-white mb-4">Reserve this Property</h3>

      {error && (
        <motion.div
          variants={staggerItem}
          className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          variants={staggerItem}
          className="p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400"
        >
          {success}
        </motion.div>
      )}

      {/* Check-in Date */}
      <motion.div variants={staggerItem} className="relative">
        <label className="block text-sm font-bold text-white mb-2">
          Check-in Date
        </label>
        <button
          type="button"
          onClick={() => {
            setShowCheckInPicker(!showCheckInPicker);
            setShowCheckOutPicker(false);
          }}
          className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-left focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
        >
          {checkInDate ? format(checkInDate, 'PPP') : 'Select check-in date'}
        </button>
        {showCheckInPicker && (
          <div className="absolute z-10 mt-2 p-4 rounded-lg bg-slate-800 border border-cyan-500/50">
            <DayPicker
              mode="single"
              selected={checkInDate}
              onSelect={(date) => {
                setCheckInDate(date);
                setShowCheckInPicker(false);
              }}
              disabled={(date) => date < today}
            />
          </div>
        )}
      </motion.div>

      {/* Check-out Date */}
      <motion.div variants={staggerItem} className="relative">
        <label className="block text-sm font-bold text-white mb-2">
          Check-out Date
        </label>
        <button
          type="button"
          onClick={() => {
            setShowCheckOutPicker(!showCheckOutPicker);
            setShowCheckInPicker(false);
          }}
          className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-left focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
        >
          {checkOutDate ? format(checkOutDate, 'PPP') : 'Select check-out date'}
        </button>
        {showCheckOutPicker && (
          <div className="absolute z-10 mt-2 p-4 rounded-lg bg-slate-800 border border-cyan-500/50">
            <DayPicker
              mode="single"
              selected={checkOutDate}
              onSelect={(date) => {
                setCheckOutDate(date);
                setShowCheckOutPicker(false);
              }}
              disabled={(date) =>
                date <= (checkInDate || today) || date < today
              }
            />
          </div>
        )}
      </motion.div>

      {/* Number of Guests */}
      <motion.div variants={staggerItem}>
        <label className="block text-sm font-bold text-white mb-2">
          Number of Guests
        </label>
        <select
          value={numberOfGuests}
          onChange={(e) => setNumberOfGuests(parseInt(e.target.value, 10))}
          className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
        >
          {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'Guest' : 'Guests'}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Special Requests */}
      <motion.div variants={staggerItem}>
        <label className="block text-sm font-bold text-white mb-2">
          Special Requests (Optional)
        </label>
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Any special requests or notes..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
        />
      </motion.div>

      {/* Price Summary */}
      {nights > 0 && (
        <motion.div
          variants={staggerItem}
          className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 space-y-2"
        >
          <div className="flex justify-between text-sm text-gray-300">
            <span>
              {nights} night{nights !== 1 ? 's' : ''} × KES {pricePerNight}
            </span>
            <span>KES {(nights * pricePerNight).toLocaleString()}</span>
          </div>
          <div className="border-t border-cyan-500/30 pt-2 flex justify-between text-lg font-bold text-white">
            <span>Total</span>
            <span>KES {totalPrice.toLocaleString()}</span>
          </div>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.div variants={staggerItem}>
        <PremiumButton
          variant="solid"
          size="lg"
          type="submit"
          disabled={isLoading || !checkInDate || !checkOutDate}
          className="w-full"
        >
          {isLoading ? 'Processing...' : 'Proceed to Payment'}
        </PremiumButton>
      </motion.div>
    </motion.form>
  );
}
