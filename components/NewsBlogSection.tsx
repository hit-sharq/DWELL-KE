'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function NewsBlogSection() {
  const [news, setNews] = React.useState<any[]>([])
  const [blogs, setBlogs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, blogRes] = await Promise.all([
          fetch('/api/site-pages?slug=news'),
          fetch('/api/site-pages?slug=blog'),
        ])
        if (newsRes.ok) setNews(await newsRes.json())
        if (blogRes.ok) setBlogs(await blogRes.json())
      } catch {
        // swallow
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const baseCard =
    'rounded-2xl border border-cyan-400/10 bg-slate-900/20 overflow-hidden h-full flex flex-col'

  return (
    <>
      {/* News */}
      <section className="py-10 sm:py-14 px-6 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Latest News</h2>
            <Link href="/news" className="text-cyan-400 text-sm hover:underline">
              View All News →
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-slate-800/20 h-64" />
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">No news articles yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {news.slice(0, 3).map((item) => {
                const newsSlug = item.slug.startsWith('news/') ? item.slug.replace(/^news\//, '') : item.slug
                const placeholderImg = '/images/news-placeholder.jpg'

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -3 }}
                    className={baseCard}
                  >
                    <Link href={`/news/${newsSlug}`} className="block h-full">
                      <div className="relative h-40 bg-slate-800/40">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">No Image</div>
                        )}
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[11px] rounded-full font-bold">
                          News
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <p className="text-xs text-cyan-400/80 font-semibold uppercase tracking-wider mb-2">
                          {new Date(item.createdAt).toLocaleDateString('en-KE', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </p>
                        <h3 className="text-base font-bold text-white mb-2 line-clamp-2">{item.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2 flex-1 mb-3">
                          {item.content?.substring(0, 120) ?? ''}...
                        </p>
                        <span className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-sm">
                          Read More
                          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Blog */}
      <section className="py-10 sm:py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">From Our Blog</h2>
            <Link href="/blog" className="text-cyan-400 text-sm hover:underline">
              View All Posts →
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-slate-800/20 h-64" />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">No blog posts yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {blogs.slice(0, 3).map((blog) => {
                const blogSlug = blog.slug.startsWith('blog/') ? blog.slug.replace(/^blog\//, '') : blog.slug
                const placeholderImg = '/images/blog-placeholder.jpg'

                return (
                  <motion.div
                    key={blog.id}
                    whileHover={{ y: -3 }}
                    className={baseCard}
                  >
                    <Link href={`/blog/${blogSlug}`} className="block h-full">
                      <div className="relative h-40 bg-slate-800/40">
                        {blog.imageUrl ? (
                          <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">No Image</div>
                        )}
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[11px] rounded-full font-bold">
                          Blog
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <p className="text-xs text-cyan-400/80 font-semibold uppercase tracking-wider mb-2">
                          {new Date(blog.createdAt).toLocaleDateString('en-KE', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </p>
                        <h3 className="text-base font-bold text-white mb-2 line-clamp-2">{blog.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2 flex-1 mb-3">
                          {blog.content?.substring(0, 120) ?? ''}...
                        </p>
                        <span className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-sm">
                          Read More
                          <ChevronRight size={16} />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
