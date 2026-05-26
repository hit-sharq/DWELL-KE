'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';

interface ContentItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminNewsPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    isPublished: false,
    type: 'news',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const [newsRes, blogRes] = await Promise.all([
        fetch('/api/admin/site-pages?filter=news'),
        fetch('/api/admin/site-pages?filter=blog'),
      ]);
      
      const news = newsRes.ok ? await newsRes.json() : [];
      const blogs = blogRes.ok ? await blogRes.json() : [];
      setItems([...news, ...blogs].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = editing 
        ? '/api/admin/site-pages' 
        : '/api/admin/site-pages';
      
      const body = editing
        ? { ...formData, id: editing.id }
        : formData;

      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save');
      
      setShowForm(false);
      setEditing(null);
      setFormData({ slug: '', title: '', content: '', isPublished: false, type: 'news' });
      fetchItems();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save content');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this content item?')) return;

    try {
      const res = await fetch(`/api/admin/site-pages?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setItems(items.filter((item) => item.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const startEdit = (item: ContentItem) => {
    setEditing(item);
    setFormData({
      slug: item.slug,
      title: item.title,
      content: item.content,
      isPublished: item.isPublished,
      type: item.slug.startsWith('news') ? 'news' : 'blog',
    });
    setShowForm(true);
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">News & Blog Manager</h1>
          <p className="text-gray-400 mt-1">Create and manage news articles and blog posts</p>
        </div>
        <PremiumButton variant="solid" onClick={() => setShowForm(true)}>
          + New Article
        </PremiumButton>
      </motion.div>

      {error && (
        <GlassmorphicCard className="border-red-400/20 bg-red-500/5 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </GlassmorphicCard>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl"
          >
            <GlassmorphicCard>
              <h2 className="text-2xl font-bold text-white mb-6">
                {editing ? 'Edit Article' : 'New Article'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-cyan-400 outline-none"
                  >
                    <option value="news">News</option>
                    <option value="blog">Blog Post</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="news/new-product-launch"
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-cyan-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Exciting News Title"
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-cyan-400 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    placeholder="Article content..."
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-cyan-400 outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    id="published"
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500"
                  />
                  <label htmlFor="published" className="text-sm text-gray-300">
                    Published
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <PremiumButton type="submit" variant="solid">
                    {editing ? 'Update' : 'Create'}
                  </PremiumButton>
                  <PremiumButton
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditing(null);
                    }}
                  >
                    Cancel
                  </PremiumButton>
                </div>
              </form>
            </GlassmorphicCard>
          </motion.div>
        </div>
      )}

      {/* Content List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-slate-800/20 h-24" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <GlassmorphicCard className="text-center py-12">
          <p className="text-gray-500 mb-4">No articles yet. Create your first one!</p>
        </GlassmorphicCard>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <GlassmorphicCard key={item.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      item.slug.startsWith('news') 
                        ? 'bg-cyan-500/20 text-cyan-300' 
                        : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {item.slug.startsWith('news') ? 'News' : 'Blog'}
                    </span>
                    {item.isPublished ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/15 text-yellow-400">
                        Draft
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">/{item.slug}</p>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {item.content.substring(0, 150)}...
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => startEdit(item)}
                    className="px-3 py-1 text-sm bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 text-sm bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </GlassmorphicCard>
          ))}
        </div>
      )}
    </div>
  );
}