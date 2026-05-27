'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { CldUploadWidget } from 'next-cloudinary';

interface ContentItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminBlogPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    isPublished: false,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/site-pages?filter=blog');
      if (res.ok) setItems(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = editing
        ? { ...formData, id: editing.id }
        : { ...formData, type: 'blog' };

      const res = await fetch('/api/admin/site-pages', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to save');
      setShowForm(false);
      setEditing(null);
      setFormData({ title: '', content: '', imageUrl: '', isPublished: false });
      fetchItems();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      const res = await fetch(`/api/admin/site-pages?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setItems(items.filter((item) => item.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Blog Manager</h1>
          <p className="text-gray-400 mt-1">Create and manage blog posts</p>
        </div>
        <PremiumButton variant="solid" onClick={() => setShowForm(true)}>
          + New Post
        </PremiumButton>
      </motion.div>

      {error && (
        <GlassmorphicCard className="border-red-400/20 bg-red-500/5 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </GlassmorphicCard>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <GlassmorphicCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editing ? 'Edit Post' : 'New Blog Post'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Post title"
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-cyan-400 outline-none"
                required
              />
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="Image URL (or upload below)"
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-cyan-400 outline-none"
              />
              <CldUploadWidget
                onSuccess={(result: any) => {
                  const url = result?.info?.secure_url;
                  if (url) setFormData({ ...formData, imageUrl: url });
                }}
                onError={(error: any) => {
                  setError('Upload failed: ' + error.message);
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="w-full px-4 py-2 rounded-lg border border-dashed border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/5 transition-colors"
                  >
                    Upload Image
                  </button>
                )}
              </CldUploadWidget>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                placeholder="Post content..."
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-cyan-400 outline-none resize-none"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                />
                <span className="text-sm text-gray-300">Published</span>
              </label>
              <div className="flex gap-3">
                <PremiumButton type="submit" variant="solid">Save</PremiumButton>
                <PremiumButton type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</PremiumButton>
              </div>
            </form>
          </GlassmorphicCard>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-slate-800/20 h-24" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <GlassmorphicCard className="text-center py-12">
          <p className="text-gray-500">No blog posts yet.</p>
        </GlassmorphicCard>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <GlassmorphicCard key={item.id}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-gray-500">/{item.slug}</p>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title} className="w-20 h-14 object-cover rounded mt-2" />
                  )}
                  <p className="text-sm text-gray-400 mt-2">{item.content?.substring(0, 100)}...</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    setEditing(item);
                    setFormData({ title: item.title, content: item.content || '', imageUrl: item.imageUrl || '', isPublished: item.isPublished });
                    setShowForm(true);
                  }} className="px-3 py-1 text-sm bg-cyan-500/20 text-cyan-400 rounded">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded">Delete</button>
                </div>
              </div>
            </GlassmorphicCard>
          ))}
        </div>
      )}
    </div>
  );
}