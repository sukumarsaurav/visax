import { Link } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import { useSEO } from '../../hooks/useSEO'
import { buildBreadcrumb, buildItemList } from '../../lib/seo'
import { BLOG_POSTS } from '../../data/blogPosts'

/**
 * Blog index — /blog
 *
 * Lists all published posts. The schema emits an ItemList of articles so
 * Google can present them as a carousel + each post URL is discoverable.
 *
 * Posts are sorted by date desc. The category is shown as a chip so users
 * can scan by country / strategy quickly.
 */
export default function BlogIndexPage() {
    const posts = [...BLOG_POSTS].sort((a, b) => new Date(b.date) - new Date(a.date))

    useSEO({
        title: 'Immigration Blog — Guides, Tips & 2026 Updates for Indians',
        description: 'Long-form guides and analysis for Indians planning to migrate abroad — Canada PR, Australia, USA, UK, Germany. Written by immigration experts.',
        keywords: 'immigration blog india, canada pr guide india, australia immigration tips, immigration news 2026',
        canonical: 'https://immizy.in/blog',
        schema: [
            buildBreadcrumb([
                { name: 'Home', url: '/' },
                { name: 'Blog', url: '/blog' },
            ]),
            buildItemList(
                posts.map(p => ({ name: p.title, url: `/blog/${p.slug}` })),
                'Article',
            ),
        ],
    })

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-[#101822]">
            <PublicHeader />

            <main id="main-content">
                {/* Hero */}
                <section className="bg-gradient-to-br from-[#0d1b2e] via-[#0f2748] to-[#0d1b2e] text-white py-20 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <span className="inline-flex items-center gap-1.5 text-blue-300 text-xs font-bold tracking-widest uppercase mb-3">
                            <span className="material-symbols-outlined text-[14px]">article</span>
                            Immizy Blog
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
                            Immigration guides for Indians, written by experts
                        </h1>
                        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                            Long-form coverage of Canada PR, Australia, USA, UK, Germany and every other pathway worth knowing in 2026.
                        </p>
                    </div>
                </section>

                {/* Post grid */}
                <section className="py-16 px-6 max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map(post => (
                            <Link key={post.slug} to={`/blog/${post.slug}`}
                                className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 hover:border-primary transition-colors group">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold uppercase tracking-wide text-primary">{post.category}</span>
                                    <span className="text-xs text-slate-400">{post.readMins} min read</span>
                                </div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors leading-tight">
                                    {post.title}
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-1">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <span>{post.author}</span>
                                    <span>{new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
