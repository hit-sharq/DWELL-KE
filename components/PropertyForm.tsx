'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CldUploadWidget } from 'next-cloudinary';
import { PremiumButton } from '@/components/PremiumButton';
import { staggerContainer, staggerItem } from '@/lib/animations';

export function PropertyForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    amenities: '',
    type: 'apartment',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms, 10),
        bathrooms: parseInt(formData.bathrooms, 10),
        amenities: formData.amenities.split(',').map(s => s.trim()).filter(Boolean),
        images,
      }),
      });

      if (!response.ok) throw new Error('Failed to create property');

      setSuccess('Property created successfully!');
      setFormData({
        title: '',
        description: '',
        location: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        amenities: '',
        type: 'apartment',
      });
      setImages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6 max-w-2xl"
    >
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

      {/* Title */}
      <motion.div variants={staggerItem}>
        <label className="block text-sm font-bold text-white mb-2">Property Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Modern 2-Bedroom Apartment in Westlands"
          className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
          required
        />
      </motion.div>

      {/* Description */}
      <motion.div variants={staggerItem}>
        <label className="block text-sm font-bold text-white mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your property in detail..."
          rows={4}
          className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
          required
        />
      </motion.div>

      {/* Location */}
      <motion.div variants={staggerItem}>
        <label className="block text-sm font-bold text-white mb-2">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          placeholder="Westlands, Nairobi"
          className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
          required
        />
      </motion.div>

      {/* Property Type */}
      <motion.div variants={staggerItem}>
        <label className="block text-sm font-bold text-white mb-2">Property Type</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
        >
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="studio">Studio</option>
          <option value="penthouse">Penthouse</option>
        </select>
      </motion.div>

      {/* Price & Bedrooms & Bathrooms */}
      <motion.div variants={staggerItem} className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-bold text-white mb-2">Price (KES)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="50000"
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-white mb-2">Bedrooms</label>
          <input
            type="number"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleInputChange}
            placeholder="2"
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-white mb-2">Bathrooms</label>
          <input
            type="number"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleInputChange}
            placeholder="1"
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            required
          />
        </div>
      </motion.div>

      {/* Amenities */}
      <motion.div variants={staggerItem}>
        <label className="block text-sm font-bold text-white mb-2">Amenities (comma-separated)</label>
        <input
          type="text"
          name="amenities"
          value={formData.amenities}
          onChange={handleInputChange}
          placeholder="WiFi, Gym, Parking, Security, Pool"
          className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
        />
      </motion.div>

      {/* Image Upload */}
      <motion.div variants={staggerItem}>
        <label className="block text-sm font-bold text-white mb-2">Property Images</label>
        <CldUploadWidget
          uploadPreset="dwell_ke"
          onSuccess={(result: any) => {
            setImages([...images, result.info.secure_url]);
          }}
          onError={(error: any) => {
            setError('Failed to upload image: ' + error.message);
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="w-full px-4 py-3 rounded-lg border border-dashed border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/5 transition-colors"
            >
              Click to upload images
            </button>
          )}
        </CldUploadWidget>

        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative">
                <img src={img} alt={`Property ${idx}`} className="w-full h-24 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Submit Button */}
      <motion.div variants={staggerItem}>
        <PremiumButton
          variant="solid"
          size="lg"
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Creating Property...' : 'Create Property'}
        </PremiumButton>
      </motion.div>
    </motion.form>
  );
}
