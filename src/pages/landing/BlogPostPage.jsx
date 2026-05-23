import { Link, useParams, Navigate } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import { useSEO } from '../../hooks/useSEO'
import { buildBreadcrumb, DESTINATIONS } from '../../lib/seo'
import { getPostBySlug, getRelatedPosts } from '../../data/blogPosts'

const BASE = 'https://immizy.in'

/**
 * Blog post — /blog/:slug
 *
 * Emits Article + BreadcrumbList JSON-LD so the post is eligible for
 * Google's Top Stories / Article rich results. Image, author, datePublished,
 * and articleBody are all required for full eligibility.
 *
 * Related-post grid links to other posts in the same category or destination
 * cluster — keeps users on the site and distributes link equity within the
 * blog hub.
 */
export default function BlogPostPage() {
    const { slug } = useParams()
    const post = getPostBySlug(slug)
    const related = getRelatedPosts(slug, 3)
    const dest = post && post.relatedDestination ? DESTINATIONS[post.relatedDestination] : null

    useSEO({
        title: post?.title,
        description: post?.excerpt || '',
        keywords: post?.keywords,
        canonical: post ? `${BASE}/blog/${post.slug}` : `${BASE}/blog`,
        schema: post ? [
            buildBreadcrumb([
                { name: 'Home', url: '/' },
                { name: 'Blog', url: '/blog' },
                { name: post.title, url: `/blog/${post.slug}` },
            ]),
            {
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: post.title,
                description: post.excerpt,
                author: { '@type': 'Organization', name: post.author || 'Immizy Editorial' },
                publisher: {
                    '@type': 'Organization',
                    name: 'Immizy',
                    logo: { '@type': 'ImageObject', url: `${BASE}/favicon.svg` },
                },
                datePublished: post.date,
                dateModified: post.date,
                mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE}/blog/${post.slug}` },
                articleSection: post.category,
                inLanguage: 'en-IN',
                // articleBody is helpful for Google to understand the full text.
                articleBody: post.body.map(b => `${b.h ? b.h + '. ' : ''}${b.p}`).join(' '),
            },
        ] : null,
    })

    if (!post) return <Navigate to="/blog" replace />

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-[#101822]">
            <PublicHeader />

            <main id="main-content">
                {/* Article header */}
                <article className="max-w-3xl mx-auto px-6 py-16">
                    <nav className="text-xs text-slate-400 mb-4">
                        <Link to="/" className="hover:text-primary">Home</Link>
                        <span className="mx-2">/</span>
                        <Link to="/blog" className="hover:text-primary">Blog</Link>
                        <span className="mx-2">/</span>
                        <span className="text-primary uppercase tracking-wider font-bold">{post.category}</span>
                    </nav>

                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-4">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
                        <span className="font-semibold">{post.author}</span>
                        <span>·</span>
                        <time dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </time>
                        <span>·</span>
                        <span>{post.readMins} min read</span>
                    </div>

                    {/* Body */}
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        {post.body.map((block, i) => (
                            <div key={i} className="mb-6">
                                {block.h && (
                                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
                                        {block.h}
                                    </h2>
                                )}
                                <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {block.p}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* CTA — link to related destination */}
                    {dest && (
                        <div className="mt-12 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-bold uppercase tracking-wider text-primary mb-2">
                                Ready to start?
                            </p>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                {dest.flag} Find a verified {dest.country} immigration consultant
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                Compare ratings, fees, and specializations from credential-checked experts on Immizy.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link to="/find-professionals" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors">
                                    Find a consultant
                                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </Link>
                                <Link to={`/immigration/${dest.slug}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold hover:border-primary hover:text-primary transition-colors">
                                    Full {dest.country} guide
                                </Link>
                            </div>
                        </div>
                    )}
                </article>

                {/* Related */}
                {related.length > 0 && (
                    <section className="py-16 px-6 bg-slate-50 dark:bg-slate-900/50">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Related posts</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {related.map(r => (
                                    <Link key={r.slug} to={`/blog/${r.slug}`}
                                        className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 hover:border-primary transition-colors">
                                        <span className="text-xs font-bold uppercase tracking-wide text-primary mb-2">{r.category}</span>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-tight">{r.title}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{r.excerpt}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    )
}
