import { Link } from 'react-router-dom'
import { useSEO } from '../../hooks/useSEO'
import { SEO } from '../../lib/seo'

const LAST_UPDATED = 'May 14, 2026'

const sections = [
    {
        id: 'acceptance',
        title: 'Acceptance of Terms',
        icon: 'check_circle',
        content: 'By creating a Immizy account or using any part of our platform, you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree, do not use Immizy. We may update these Terms at any time; continued use after a change constitutes acceptance. Material changes will be communicated by email or platform notice.',
    },
    {
        id: 'accounts',
        title: 'Account Registration',
        icon: 'person_add',
        content: 'You must be at least 18 years old to create an account. You agree to provide accurate, current information and to keep it updated. You are responsible for all activity that occurs under your account. Do not share your login credentials. Notify us immediately at support@immizy.in if you suspect unauthorized access. Immizy reserves the right to suspend or terminate accounts that provide false information or violate these Terms.',
    },
    {
        id: 'platform-role',
        title: 'Immizy\'s Role',
        icon: 'hub',
        content: 'Immizy is a marketplace platform that connects clients with independent immigration professionals. We are not an immigration law firm, legal advisor, or immigration consultant. We do not provide legal advice. The professionals you engage through Immizy are independent contractors, not employees or agents of Immizy. Immizy does not guarantee the outcome of any immigration application or proceeding.',
    },
    {
        id: 'professional-conduct',
        title: 'Professional Standards',
        icon: 'verified',
        content: 'Immigration professionals who register on Immizy represent that they hold all licenses, accreditations, and regulatory approvals required by applicable law to provide the services they offer. Professionals agree to: maintain current credentials; provide services described accurately; not misrepresent their qualifications; comply with all applicable professional conduct rules; and not solicit clients for off-platform transactions to circumvent our fee structure. Immizy periodically re-verifies credentials but is not responsible for a professional\'s misrepresentation.',
    },
    {
        id: 'payments',
        title: 'Payments & Fees',
        icon: 'payments',
        content: 'Clients pay for services at the rates displayed on each professional\'s profile. Immizy charges a platform fee on each transaction, which is deducted from the professional\'s payout. All fees are displayed before checkout. Payments are processed by Stripe; by using the platform you agree to Stripe\'s terms of service. Refunds are subject to the refund policy agreed to at time of booking and any applicable consumer protection laws. In the event of a dispute, Immizy may facilitate a resolution but is not obligated to refund at its sole discretion.',
    },
    {
        id: 'content',
        title: 'User Content',
        icon: 'edit_note',
        content: 'You retain ownership of content you submit (profile information, messages, documents, reviews). By submitting content, you grant Immizy a non-exclusive, worldwide, royalty-free license to use, display, and distribute it as necessary to operate the platform. You are responsible for ensuring your content does not violate any third-party rights and complies with applicable law. Immizy may remove content that violates these Terms without notice.',
    },
    {
        id: 'prohibited',
        title: 'Prohibited Conduct',
        icon: 'block',
        items: [
            'Impersonating any person or entity, or misrepresenting your qualifications.',
            'Uploading or sharing fraudulent, misleading, or harmful documents.',
            'Attempting to circumvent our fee structure by soliciting off-platform payments.',
            'Using the platform to harass, threaten, or discriminate against any person.',
            'Scraping, reverse-engineering, or attempting to extract data from Immizy.',
            'Using automated bots, scripts, or tools to access the platform without authorization.',
            'Attempting to interfere with the security or integrity of our systems.',
            'Violating any applicable local, national, or international law or regulation.',
        ],
    },
    {
        id: 'intellectual-property',
        title: 'Intellectual Property',
        icon: 'copyright',
        content: 'The Immizy platform, including its design, software, trademarks, and content created by Immizy, is owned by Immizy Inc. and protected by applicable intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written consent. Feedback and suggestions you provide to us may be used to improve our products without obligation to you.',
    },
    {
        id: 'disclaimers',
        title: 'Disclaimers',
        icon: 'warning',
        content: 'THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. IMMIZY DOES NOT WARRANT THAT THE PLATFORM WILL BE ERROR-FREE, UNINTERRUPTED, OR SECURE. WE DO NOT WARRANT THE ACCURACY OR COMPLETENESS OF ANY CONTENT ON THE PLATFORM, INCLUDING PROFESSIONAL PROFILES OR REVIEWS. IMMIGRATION LAWS CHANGE FREQUENTLY; ALWAYS CONSULT A QUALIFIED PROFESSIONAL AND VERIFY CURRENT REQUIREMENTS WITH THE RELEVANT GOVERNMENT AUTHORITY.',
    },
    {
        id: 'limitation-liability',
        title: 'Limitation of Liability',
        icon: 'shield',
        content: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, IMMIZY AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES — INCLUDING LOST PROFITS, LOSS OF DATA, OR DENIAL OF AN IMMIGRATION APPLICATION — ARISING FROM YOUR USE OF THE PLATFORM. OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM YOUR USE OF IMMIZY SHALL NOT EXCEED THE GREATER OF (A) THE FEES YOU PAID TO IMMIZY IN THE 12 MONTHS PRECEDING THE CLAIM OR (B) $100 USD.',
    },
    {
        id: 'termination',
        title: 'Termination',
        icon: 'logout',
        content: 'You may terminate your account at any time from your account settings. Immizy may suspend or terminate your account immediately, without notice, if we determine you have violated these Terms, engaged in fraudulent activity, or pose a risk to other users or the platform. Upon termination, your right to use the platform ceases immediately. Provisions that by their nature should survive termination (including payment obligations, intellectual property rights, disclaimers, and limitation of liability) shall survive.',
    },
    {
        id: 'governing-law',
        title: 'Governing Law & Disputes',
        icon: 'balance',
        content: 'These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict-of-law principles. Any dispute arising from or relating to these Terms or the platform shall first be subject to informal resolution: contact us at legal@immizy.in and we will attempt to resolve it within 30 days. If informal resolution fails, disputes shall be resolved by binding arbitration under the JAMS Rules, conducted in English in Wilmington, Delaware. You waive any right to a jury trial or class action participation.',
    },
]

export default function TermsPage() {
    useSEO(SEO.terms)
    return (
        <div className="min-h-screen bg-white dark:bg-[#0d1117]">
            {/* Header */}
            <section className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 py-16 px-6">
                <div className="max-w-3xl mx-auto">
                    <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="text-slate-900 dark:text-white font-medium">Terms of Service</span>
                    </nav>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">description</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Terms of Service</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">Last updated: {LAST_UPDATED}</p>
                    <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                        These Terms govern your use of the Immizy platform. Please read them carefully. If you have questions, contact us at <a href="mailto:legal@immizy.in" className="text-primary hover:underline">legal@immizy.in</a> before using the service.
                    </p>
                </div>
            </section>

            {/* TOC + Content */}
            <div className="max-w-6xl mx-auto px-6 py-12 flex gap-12">
                {/* Sticky TOC */}
                <aside className="hidden lg:block w-56 flex-shrink-0">
                    <div className="sticky top-8">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Contents</p>
                        <nav className="flex flex-col gap-1">
                            {sections.map(s => (
                                <a key={s.id} href={`#${s.id}`}
                                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors py-1">
                                    {s.title}
                                </a>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Content */}
                <article className="flex-1 min-w-0 space-y-10">
                    {sections.map(({ id, title, icon, content, items }) => (
                        <section key={id} id={id} className="scroll-mt-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                                </div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">{title}</h2>
                            </div>
                            {content && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{content}</p>
                            )}
                            {items && (
                                <ul className="space-y-2">
                                    {items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-red-400 text-[16px] mt-0.5 flex-shrink-0">cancel</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}

                    {/* Contact */}
                    <section id="contact-legal" className="scroll-mt-8 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Contact</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Questions about these Terms?</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Immizy Inc. — Legal Team</p>
                        <a href="mailto:legal@immizy.in" className="text-sm text-primary hover:underline">legal@immizy.in</a>
                    </section>
                </article>
            </div>
        </div>
    )
}
