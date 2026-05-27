'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string;
}

export function NewsBlogSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [blogs, setBlogs] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, blogRes] = await Promise.all([
          fetch('/api/site-pages?slug=news'),
          fetch('/api/site-pages?slug=blog'),
        ]);
        if (newsRes.ok) setNews(await newsRes.json());
        if (blogRes.ok) setBlogs(await blogRes.json());
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <>
      {/* News Section */}
      <section className="py-20 px-6 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Latest News</h2>
            <Link href="/news" className="text-cyan-400 text-sm hover:underline">
              View All News →
            </Link>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-slate-800/20 h-32" />
              ))}
            </div>
          ) : news.length === 0 ? (
            <GlassmorphicCard className="py-8 text-center">
              <p className="text-gray-500">No news articles yet.</p>
            </GlassmorphicCard>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {news.slice(0, 3).map((item) => (
                <GlassmorphicCard key={item.id}>
                  <Link href={`/news?slug=${item.slug.split('/')[1]}`}>
                    <h3 className="text-xl font-bold text-white mb-2 hover:text-cyan-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-3">
                      {item.content.substring(0, 120)}...
                    </p>
                  </Link>
                </GlassmorphicCard>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">From Our Blog</h2>
            <Link href="/blog" className="text-cyan-400 text-sm hover:underline">
              View All Posts →
            </Link>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-slate-800/20 h-32" />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <GlassmorphicCard className="py-8 text-center">
              <p className="text-gray-500">No blog posts yet.</p>
            </GlassmorphicCard>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {blogs.slice(0, 3).map((blog) => (
                <GlassmorphicCard key={blog.id}>
                  <Link href={`/blog?slug=${blog.slug.split('/')[1]}`}>
                    <h3 className="text-lg font-bold text-white mb-2 hover:text-cyan-400 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-3">
                      {blog.content.substring(0, 120)}...
                    </p>
                  </Link>
                </GlassmorphicCard>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}