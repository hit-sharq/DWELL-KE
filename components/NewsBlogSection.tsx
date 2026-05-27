'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { ChevronRight } from 'lucide-react';

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
                <div key={item.id} className="group">
                  <GlassmorphicCard className="h-full flex flex-col hover:border-cyan-400/50 transition-all duration-300">
                    <div className="flex-1 flex flex-col">
                      <p className="text-xs text-cyan-400/80 font-semibold uppercase tracking-wider mb-3">
                        {new Date(item.createdAt).toLocaleDateString('en-KE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <h3 className="text-lg font-bold text-white mb-3 line-clamp-3 group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-3 flex-1 mb-4">
                        {item.content.substring(0, 150)}...
                      </p>
                    </div>
                    <Link 
                      href={`/news?slug=${item.slug.split('/')[1]}`}
                      className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition-all duration-300 group-hover:gap-3"
                    >
                      Read More
                      <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </GlassmorphicCard>
                </div>
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
                <div key={blog.id} className="group">
                  <GlassmorphicCard className="h-full flex flex-col hover:border-cyan-400/50 transition-all duration-300">
                    <div className="flex-1 flex flex-col">
                      <p className="text-xs text-cyan-400/80 font-semibold uppercase tracking-wider mb-3">
                        {new Date(blog.createdAt).toLocaleDateString('en-KE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <h3 className="text-lg font-bold text-white mb-3 line-clamp-3 group-hover:text-cyan-300 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-3 flex-1 mb-4">
                        {blog.content.substring(0, 150)}...
                      </p>
                    </div>
                    <Link 
                      href={`/blog?slug=${blog.slug.split('/')[1]}`}
                      className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition-all duration-300 group-hover:gap-3"
                    >
                      Read More
                      <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </GlassmorphicCard>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
