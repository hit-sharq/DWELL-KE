'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  imageUrl?: string | null;
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
      } catch {
        // swallow
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {/* News Section */}
      <section className="py-10 sm:py-20 px-6 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Latest News</h2>
            <Link href="/news" className="text-cyan-400 text-sm hover:underline">
              View All News →
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-xl bg-slate-800/20 h-26" />
              ))}
            </div>
          ) : news.length === 0 ? (

            <div className="py-8 text-center">
              <p className="text-gray-500">No news articles yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {news.slice(0, 3).map((item) => {
                const slugPart = item.slug.split('/')[1] || item.slug;
                const placeholderImg = '/images/news-placeholder.jpg';

                const newsSlug = item.slug.startsWith('news/') ? item.slug.replace(/^news\//, '') : item.slug;

                return (
                  <div key={item.id}>
                    <article className="group">
                      <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-[0_0_18px_rgba(34,211,238,0.12)] transition-all duration-600 relative overflow-hidden h-full flex flex-col">
                        {/* Image Area */}
                        <div className="h-[160px] sm:h-[200px] overflow-hidden bg-slate-800/20">
                          <img
                            src={item.imageUrl || placeholderImg}
                            alt={item.title}
                            className="w-full h-full object-fit-cover transition-transform duration-400 group-hover:scale-105"
                          />
                        </div>


                        {/* Category Badge */}
                        <span className="absolute top-4 right-4 bg-cyan-500/40 backdrop-blur text-cyan-50 px-3 py-1 rounded-full text-xs font-medium border border-cyan-400/20">
                          Company Update
                        </span>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col p-4 sm:p-6">
                          <p className="text-xs text-cyan-400/80 font-semibold uppercase tracking-wider mb-3">
                            {new Date(item.createdAt).toLocaleDateString('en-KE', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <h3 className="text-lg font-bold text-white mb-3 line-clamp-3 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-400 line-clamp-3 flex-1 mb-4">
                            {item.content.substring(0, 150)}...
                          </p>

                          <Link
                            href={`/news/${newsSlug}`}
                            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition-all duration-300"
                          >
                            Read More
                            <ChevronRight
                              size={16}
                              className="transition-transform group-hover:translate-x-1"
                            />
                          </Link>
                        </div>
                      </div>
                    </article>
                  </div>
                );
              })}
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
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-xl bg-slate-800/20 h-26" />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">No blog posts yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {blogs.slice(0, 3).map((blog) => {
                const blogSlug = blog.slug.startsWith('blog/') ? blog.slug.replace(/^blog\//, '') : blog.slug;
                const placeholderImg = '/images/blog-placeholder.jpg';

                return (
                  <div key={blog.id}>
                    <article className="group">
                      <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-[0_0_18px_rgba(34,211,238,0.12)] transition-all duration-600 relative overflow-hidden h-full flex flex-col">
                        {/* Image Area */}
                        <div className="h-[160px] sm:h-[200px] overflow-hidden bg-slate-800/20">
                          <img
                            src={blog.imageUrl || placeholderImg}
                            alt={blog.title}
                            className="w-full h-full object-fit-cover transition-transform duration-400 group-hover:scale-105"
                          />
                        </div>

                        {/* Category Badge */}
                        <span className="absolute top-4 right-4 bg-cyan-500/40 backdrop-blur text-cyan-50 px-3 py-1 rounded-full text-xs font-medium border border-cyan-400/20">
                          Property Insights
                        </span>

                        {/* Content Area */}
                         <div className="flex-1 flex flex-col p-4 sm:p-6">
                           <p className="text-xs text-cyan-400/80 font-semibold uppercase tracking-wider mb-3">
                             {new Date(blog.createdAt).toLocaleDateString('en-KE', {
                               year: 'numeric',
                               month: 'short',
                               day: 'numeric',
                             })}
                           </p>

                           <h3 className="text-lg font-bold text-white mb-3 line-clamp-3 transition-colors">
                             {blog.title}
                           </h3>

                           <p className="text-sm text-gray-400 line-clamp-3 flex-1 mb-4">
                             {blog.content.substring(0, 150)}...
                           </p>

                           <Link
                             href={`/blog/${blogSlug}`}
                             className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition-all duration-300"
                           >
                             Read More
                             <ChevronRight
                               size={16}
                               className="transition-transform group-hover:translate-x-1"
                             />
                           </Link>
                         </div>
                       </div>
                     </article>
                   </div>
                 );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

