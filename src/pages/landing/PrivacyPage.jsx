import { Link } from 'react-router-dom'
import { useSEO } from '../../hooks/useSEO'
import { SEO } from '../../lib/seo'

const LAST_UPDATED = 'May 14, 2026'

const sections = [
    {
        id: 'information-we-collect',
        title: 'Information We Collect',
        icon: 'database',
        content: [
            { subtitle: 'Information you provide directly', text: 'When you create an account, we collect your name, email address, phone number, and any profile information you choose to add. Professionals additionally provide credentials, licensing information, and professional history for verification purposes.' },
            { subtitle: 'Information from your use of the platform', text: 'We collect data about how you use Immizy, including pages viewed, features used, search queries, appointment bookings, messages sent (metadata only), and documents uploaded. We also log IP addresses, browser type, device information, and timestamps.' },
            { subtitle: 'Payment information', text: 'Payment card details are processed directly by our payment processor (Stripe) and are never stored on our servers. We retain only transaction metadata such as amount, date, and last four digits of the card.' },
            { subtitle: 'Communications', text: 'If you contact our support team or communicate with professionals through the platform, we store those communications to provide the service and resolve disputes.' },
        ],
    },
    {
        id: 'how-we-use',
        title: 'How We Use Your Information',
        icon: 'manage_accounts',
        content: [
            { subtitle: 'To provide and improve the service', text: 'We use your information to operate the platform, process bookings and payments, facilitate communication between clients and professionals, verify professional credentials, and improve our features and algorithms.' },
            { subtitle: 'To communicate with you', text: 'We send transactional emails (booking confirmations, receipts, account alerts) and, with your consent, promotional emails about new features or offers. You can opt out of marketing emails at any time.' },
            { subtitle: 'For safety and fraud prevention', text: 'We monitor for suspicious activity, investigate abuse reports, and verify professional credentials to maintain the integrity of the platform and protect all users.' },
            { subtitle: 'To comply with legal obligations', text: 'We may process or disclose data as required by applicable law, court order, or government authority, and to enforce our Terms of Service.' },
        ],
    },
    {
        id: 'sharing',
        title: 'How We Share Your Information',
        icon: 'share',
        content: [
            { subtitle: 'With professionals and clients', text: 'When you book a consultation or communicate through the platform, relevant profile information is shared with the other party to enable the service.' },
            { subtitle: 'With service providers', text: 'We share data with trusted third-party vendors (e.g., Stripe for payments, SendGrid for email, cloud storage providers) who are contractually bound to protect it and may only use it to provide services to us.' },
            { subtitle: 'We do not sell your data', text: 'Immizy does not sell, rent, or trade your personal information to third parties for their marketing purposes. Full stop.' },
            { subtitle: 'Business transfers', text: 'In the event of a merger, acquisition, or sale of assets, your data may be transferred to the successor entity. We will notify you by email or prominent notice on the platform before your data is subject to a different privacy policy.' },
        ],
    },
    {
        id: 'retention',
        title: 'Data Retention',
        icon: 'schedule',
        content: [
            { subtitle: 'Active accounts', text: 'We retain your data for as long as your account is active or as needed to provide you with services.' },
            { subtitle: 'After account deletion', text: 'When you delete your account, we delete or anonymize your personal data within 30 days, except where we are required to retain it by law (e.g., financial records for 7 years) or where data has been shared with a professional as part of a case record.' },
        ],
    },
    {
        id: 'your-rights',
        title: 'Your Rights',
        icon: 'gavel',
        content: [
            { subtitle: 'Access and portability', text: 'You may request a copy of all personal data we hold about you, in a machine-readable format, at any time from your account settings.' },
            { subtitle: 'Correction', text: 'You can update most of your profile information directly from your account settings. For data you cannot edit yourself, contact support.' },
            { subtitle: 'Deletion', text: 'You can delete your account at any time. We will process the deletion as described in the Data Retention section above.' },
            { subtitle: 'Objection and restriction', text: 'You have the right to object to or restrict certain processing of your data, particularly for direct marketing. To exercise this right, contact privacy@immizy.in.' },
            { subtitle: 'GDPR and CCPA', text: 'If you are located in the European Economic Area or California, you have additional rights under GDPR and the CCPA respectively. Contact us to exercise these rights.' },
        ],
    },
    {
        id: 'security',
        title: 'Security',
        icon: 'lock',
        content: [
            { subtitle: 'Encryption', text: 'All data in transit is encrypted using TLS 1.3. Data at rest is encrypted using AES-256.' },
            { subtitle: 'Access controls', text: 'Access to production data is restricted to authorized personnel on a need-to-know basis, protected by multi-factor authentication.' },
            { subtitle: 'Incident response', text: 'We maintain an incident response plan and will notify affected users and relevant authorities within 72 hours of discovering a breach that poses a risk to your rights and freedoms.' },
        ],
    },
    {
        id: 'cookies',
        title: 'Cookies',
        icon: 'cookie',
        content: [
            { subtitle: 'Essential cookies', text: 'We use cookies required for the platform to function — session tokens, CSRF protection, and load-balancing cookies. These cannot be disabled.' },
            { subtitle: 'Analytics cookies', text: 'With your consent, we use analytics tools to understand how the platform is used and where we can improve. You can withdraw consent at any time via the cookie settings in your account.' },
            { subtitle: 'No third-party advertising cookies', text: 'We do not place third-party advertising or tracking cookies on our platform.' },
        ],
    },
]

export default function PrivacyPage() {
    useSEO(SEO.privacy)
    return (
        <div className="min-h-screen bg-white dark:bg-[#0d1117]">
            {/* Header */}
            <section className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 py-16 px-6">
                <div className="max-w-3xl mx-auto">
                    <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="text-slate-900 dark:text-white font-medium">Privacy Policy</span>
                    </nav>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">privacy_tip</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Privacy Policy</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">Last updated: {LAST_UPDATED}</p>
                    <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                        At Immizy, your privacy is fundamental to how we build our product. This policy explains what data we collect, how we use it, and the controls you have over it. We've written it to be readable, not just legally compliant.
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
                <article className="flex-1 min-w-0 space-y-12">
                    {sections.map(({ id, title, icon, content }) => (
                        <section key={id} id={id} className="scroll-mt-8">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                                </div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">{title}</h2>
                            </div>
                            <div className="space-y-4">
                                {content.map(({ subtitle, text }) => (
                                    <div key={subtitle}>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{subtitle}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{text}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}

                    {/* Contact */}
                    <section id="contact-privacy" className="scroll-mt-8 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Contact Us</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                            For privacy-related questions or to exercise your rights, contact our Privacy Team:
                        </p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Immizy Inc.</p>
                        <a href="mailto:privacy@immizy.in" className="text-sm text-primary hover:underline">privacy@immizy.in</a>
                    </section>
                </article>
            </div>
        </div>
    )
}
