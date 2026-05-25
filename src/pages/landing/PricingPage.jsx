import { useState } from 'react'
import { useSEO } from '../../hooks/useSEO'
import { SEO } from '../../lib/seo'
import { Link } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'

// ─────────────────────────────────────────────────────────────────────────────
// PLAN DATA
// Prices are in INR, exclusive of 18% GST.
// Yearly = monthly × 10 (2 months free, ~16% discount).
//
// These MUST stay in sync with:
//   • src/pages/auth/ProfessionalRegisterPage.jsx  → individualPlans[] / agencyPlans[]
//   • supabase/functions/create-razorpay-order/index.ts → PLANS[].price_inr
// ─────────────────────────────────────────────────────────────────────────────

const individualPlans = [
    {
        id: 'solo_basic',
        name: 'Solo Basic',
        description: 'Everything a solo consultant needs to get started.',
        monthlyPrice: 499,
        yearlyPrice: 4990,          // ₹416/mo equivalent
        maxCases: 10,
        maxClients: 10,
        seats: 1,
        features: [
            { text: '1 Consultant Seat', highlighted: false },
            { text: 'Up to 10 Active Cases', highlighted: true },
            { text: 'Up to 10 Clients', highlighted: true },
            { text: 'Client Portal Access', highlighted: false },
            { text: 'Document Storage (2 GB)', highlighted: false },
            { text: 'Basic Analytics', highlighted: false },
            { text: 'Email Support', highlighted: false },
        ],
        buttonText: 'Start Free Trial',
        buttonStyle: 'secondary',
        cta: '/professional-register?plan=solo_basic',
        popular: false,
    },
    {
        id: 'solo_pro',
        name: 'Solo Pro',
        description: 'More capacity and tools for a growing solo practice.',
        monthlyPrice: 999,
        yearlyPrice: 9990,          // ₹832/mo equivalent
        maxCases: 30,
        maxClients: 30,
        seats: 1,
        features: [
            { text: '1 Consultant Seat', highlighted: false },
            { text: 'Up to 30 Active Cases', highlighted: true },
            { text: 'Up to 30 Clients', highlighted: true },
            { text: 'Client Portal Access', highlighted: false },
            { text: 'Document Storage (10 GB)', highlighted: false },
            { text: 'Advanced Analytics', highlighted: false },
            { text: 'Invoicing & Payments', highlighted: false },
            { text: 'Custom Branding', highlighted: false },
            { text: 'Priority Support', highlighted: false },
        ],
        buttonText: 'Start Free Trial',
        buttonStyle: 'primary',
        cta: '/professional-register?plan=solo_pro',
        popular: true,
    },
]

const agencyPlans = [
    {
        id: 'agency_starter',
        name: 'Starter',
        description: 'Perfect for small firms just getting started.',
        monthlyPrice: 2999,
        yearlyPrice: 29990,         // ₹2,499/mo equivalent
        maxTeamMembers: 3,
        maxCases: 50,
        features: [
            { text: 'Up to 3 Team Members', highlighted: true },
            { text: '50 Active Cases', highlighted: true },
            { text: 'Document Storage (10 GB)', highlighted: false },
            { text: 'Client Portal Access', highlighted: false },
            { text: 'Basic Analytics', highlighted: false },
            { text: 'Email Support', highlighted: false },
        ],
        buttonText: 'Start Free Trial',
        buttonStyle: 'secondary',
        cta: '/professional-register?plan=agency_starter',
        popular: false,
    },
    {
        id: 'agency_growth',
        name: 'Growth',
        description: 'For expanding agencies with active caseloads.',
        monthlyPrice: 6999,
        yearlyPrice: 69990,         // ₹5,832/mo equivalent
        maxTeamMembers: 10,
        maxCases: 200,
        features: [
            { text: 'Up to 10 Team Members', highlighted: true },
            { text: '200 Active Cases', highlighted: true },
            { text: 'Document Storage (50 GB)', highlighted: false },
            { text: 'Client Portal Access', highlighted: false },
            { text: 'Advanced Analytics & Reporting', highlighted: false },
            { text: 'Custom Branding', highlighted: false },
            { text: 'Invoicing & Payments', highlighted: false },
            { text: 'Team Collaboration Tools', highlighted: false },
            { text: 'Priority Support', highlighted: false },
        ],
        buttonText: 'Start Free Trial',
        buttonStyle: 'primary',
        cta: '/professional-register?plan=agency_growth',
        popular: true,
    },
    {
        id: 'agency_enterprise',
        name: 'Enterprise',
        description: 'Full-scale for large multinational firms.',
        monthlyPrice: 14999,
        yearlyPrice: 149990,        // ₹12,499/mo equivalent
        maxTeamMembers: null,
        maxCases: null,
        features: [
            { text: 'Unlimited Team Members', highlighted: true },
            { text: 'Unlimited Active Cases', highlighted: true },
            { text: 'Unlimited Document Storage', highlighted: false },
            { text: 'Advanced Analytics & Reporting', highlighted: false },
            { text: 'Custom Branding', highlighted: false },
            { text: 'API Access', highlighted: false },
            { text: 'SSO Integration', highlighted: false },
            { text: 'Dedicated Account Manager', highlighted: false },
            { text: 'SLA-backed Support', highlighted: false },
        ],
        buttonText: 'Contact Sales',
        buttonStyle: 'secondary',
        cta: '/support#contact',
        popular: false,
    },
]

// ─── Comparison table rows ────────────────────────────────────────────────────

const individualComparison = [
    { name: 'Consultant Seats',   basic: '1',          pro: '1' },
    { name: 'Active Cases',       basic: '10',         pro: '30' },
    { name: 'Clients',            basic: '10',         pro: '30' },
    { name: 'Document Storage',   basic: '2 GB',       pro: '10 GB' },
    { name: 'Client Portal',      basic: 'check',      pro: 'check_circle' },
    { name: 'Basic Analytics',    basic: 'check',      pro: 'check_circle' },
    { name: 'Advanced Analytics', basic: 'remove',     pro: 'check_circle' },
    { name: 'Invoicing',          basic: 'remove',     pro: 'check_circle' },
    { name: 'Custom Branding',    basic: 'remove',     pro: 'check_circle' },
    { name: 'Priority Support',   basic: 'remove',     pro: 'check_circle' },
]

const agencyComparison = [
    { name: 'Team Members',       starter: '3',        growth: '10',        enterprise: 'Unlimited' },
    { name: 'Active Cases',       starter: '50',       growth: '200',       enterprise: 'Unlimited' },
    { name: 'Document Storage',   starter: '10 GB',    growth: '50 GB',     enterprise: 'Unlimited' },
    { name: 'Client Portal',      starter: 'check',    growth: 'check_circle', enterprise: 'check_circle' },
    { name: 'Basic Analytics',    starter: 'check',    growth: 'check_circle', enterprise: 'check_circle' },
    { name: 'Advanced Analytics', starter: 'remove',   growth: 'check_circle', enterprise: 'check_circle' },
    { name: 'Custom Branding',    starter: 'remove',   growth: 'check_circle', enterprise: 'check_circle' },
    { name: 'Invoicing',          starter: 'remove',   growth: 'check_circle', enterprise: 'check_circle' },
    { name: 'API Access',         starter: 'remove',   growth: 'remove',    enterprise: 'check_circle' },
    { name: 'SSO Integration',    starter: 'remove',   growth: 'remove',    enterprise: 'check_circle' },
    { name: 'Account Manager',    starter: 'remove',   growth: 'remove',    enterprise: 'check_circle' },
    { name: 'Priority Support',   starter: 'remove',   growth: 'check_circle', enterprise: 'check_circle' },
    { name: 'Dedicated Support',  starter: 'remove',   growth: 'remove',    enterprise: 'check_circle' },
]

const faqs = [
    {
        question: 'What happens after the 15-day free trial?',
        answer: 'Your trial gives you full access to all features on your chosen plan at no cost. After 15 days you can continue by entering your payment details. We\'ll remind you before the trial ends — no charges without your confirmation.',
    },
    {
        question: 'Can I switch between Individual and Agency plans?',
        answer: 'Yes. You can upgrade from any Individual plan to an Agency plan at any time. The difference in price is prorated to your current billing cycle.',
    },
    {
        question: 'Can I change plans later?',
        answer: 'Absolutely. Upgrade or downgrade at any time. Upgrades take effect immediately (prorated); downgrades apply at the next billing cycle.',
    },
    {
        question: 'What payment methods do you accept?',
        answer: 'Payments are processed securely via Razorpay. We accept all major Indian credit & debit cards (Visa, Mastercard, RuPay), UPI (Google Pay, PhonePe, Paytm), Netbanking from 50+ banks, and EMI on select cards. International cards are supported for Enterprise plans.',
    },
    {
        question: 'Are prices inclusive of GST?',
        answer: 'Listed prices are exclusive of 18% GST. GST will be added at checkout and a tax invoice will be issued.',
    },
    {
        question: 'Do you offer a refund policy?',
        answer: 'Yes — we offer a 7-day money-back guarantee after your trial ends, no questions asked. Enterprise refunds are handled per the contractual terms.',
    },
    {
        question: 'Can I add more cases beyond my plan limit?',
        answer: 'Plans have a fixed case limit. If you need more, simply upgrade to the next tier. For large one-off spikes, contact our sales team — we can arrange temporary capacity.',
    },
    {
        question: 'Can I pay annually instead of monthly?',
        answer: 'Yes — annual billing gives you 2 months free (effectively ~16% off). You can switch to annual billing at any time from your account settings.',
    },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ICON_VALUES = ['check', 'check_circle', 'remove']

function IconCell({ value, highlight }) {
    if (ICON_VALUES.includes(value)) {
        const colour =
            value === 'remove'
                ? 'text-slate-300 dark:text-slate-600'
                : highlight
                ? 'text-primary'
                : 'text-primary'
        return <span className={`material-symbols-outlined text-xl ${colour}`}>{value}</span>
    }
    return <span>{value}</span>
}

function formatINR(n) {
    return n.toLocaleString('en-IN')
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PricingPage() {
    useSEO(SEO.pricing)
    const [planType, setPlanType]         = useState('individual') // 'individual' | 'agency'
    const [billingPeriod, setBillingPeriod] = useState('monthly')  // 'monthly' | 'yearly'

    const plans = planType === 'individual' ? individualPlans : agencyPlans

    const getPrice = (plan) => {
        if (plan.monthlyPrice === 0) return 0
        return billingPeriod === 'yearly'
            ? Math.round(plan.yearlyPrice / 12)
            : plan.monthlyPrice
    }

    const getPeriodLabel = (plan) => {
        if (plan.monthlyPrice === 0) return 'forever'
        return billingPeriod === 'yearly'
            ? `/mo · billed ₹${formatINR(plan.yearlyPrice)}/yr`
            : '/mo'
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            <PublicHeader />

            <main className="flex-1">

                {/* ── Header ── */}
                <div className="w-full px-4 md:px-20 py-12 flex flex-col items-center justify-center text-center">
                    <div className="max-w-[960px] flex flex-col items-center gap-4">
                        {/* Trial badge */}
                        <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-sm font-semibold px-4 py-1.5 rounded-full">
                            <span className="material-symbols-outlined text-[16px]">celebration</span>
                            15-day free trial on all plans · No credit card required
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-normal leading-normal max-w-2xl">
                            Whether you work solo or lead a team, there's a plan built for your practice.
                        </p>
                    </div>
                </div>

                {/* ── Plan-type toggle (Individual / Agency) ── */}
                <div className="w-full flex justify-center px-4 pb-6">
                    <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-xl inline-flex">
                        <button
                            onClick={() => setPlanType('individual')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all text-sm font-bold ${
                                planType === 'individual'
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">person</span>
                            Individual
                        </button>
                        <button
                            onClick={() => setPlanType('agency')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all text-sm font-bold ${
                                planType === 'agency'
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
                            Agency / Team
                        </button>
                    </div>
                </div>

                {/* ── Billing period toggle ── */}
                <div className="w-full flex flex-col items-center px-4 pb-10">
                    <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 rounded-xl inline-flex mb-3">
                        <button
                            onClick={() => setBillingPeriod('monthly')}
                            className={`px-5 py-1.5 rounded-lg transition-all text-sm font-semibold ${
                                billingPeriod === 'monthly'
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingPeriod('yearly')}
                            className={`px-5 py-1.5 rounded-lg transition-all text-sm font-semibold ${
                                billingPeriod === 'yearly'
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                            Yearly&nbsp;
                            <span className="text-primary text-xs font-extrabold">2 months free</span>
                        </button>
                    </div>

                    {/* Savings badge for yearly billing */}
                    {billingPeriod === 'yearly' && (
                        <div className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 px-3 py-1 rounded-full animate-pulse">
                            <span className="text-green-600 dark:text-green-400 text-sm font-bold">💰 Save up to 16%</span>
                        </div>
                    )}
                </div>

                {/* ── Plan context line ── */}
                <div className="w-full flex justify-center px-4 pb-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                        {planType === 'individual'
                            ? 'Perfect for solo immigration consultants managing their own client base.'
                            : 'Built for teams — add consultants, assign cases, and collaborate at scale.'}
                    </p>
                </div>

                {/* ── Pricing Cards ── */}
                <div className="w-full px-4 md:px-10 lg:px-20 pb-12">
                    <div className={`max-w-[1200px] mx-auto grid grid-cols-1 gap-6 ${
                        plans.length === 2
                            ? 'md:grid-cols-2 max-w-[800px]'
                            : 'md:grid-cols-3'
                    }`}>
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col gap-6 rounded-2xl p-8 shadow-sm transition-transform hover:-translate-y-1 ${
                                    plan.popular
                                        ? 'border-2 border-primary bg-white dark:bg-slate-800 shadow-xl transform md:scale-105 z-10'
                                        : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                                }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                                        Most Popular
                                    </div>
                                )}

                                {/* Plan header */}
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-slate-900 dark:text-white text-xl font-bold">{plan.name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">{plan.description}</p>

                                    {/* Key limit pills */}
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {planType === 'individual' ? (
                                            <>
                                                <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                                                    <span className="material-symbols-outlined text-[13px]">folder_open</span>
                                                    {plan.maxCases} Cases
                                                </span>
                                                <span className="inline-flex items-center gap-1 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                                                    <span className="material-symbols-outlined text-[13px]">group</span>
                                                    {plan.maxClients} Clients
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                                                    <span className="material-symbols-outlined text-[13px]">folder_open</span>
                                                    {plan.maxCases ?? 'Unlimited'} Cases
                                                </span>
                                                <span className="inline-flex items-center gap-1 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                                                    <span className="material-symbols-outlined text-[13px]">badge</span>
                                                    {plan.maxTeamMembers ?? 'Unlimited'} Members
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div className="flex flex-col gap-1 mt-2">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-slate-900 dark:text-white text-4xl font-black tracking-tight">
                                                ₹{formatINR(getPrice(plan))}
                                            </span>
                                            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                                                {getPeriodLabel(plan)}
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-400 dark:text-slate-500">Exclusive of 18% GST</span>
                                    </div>
                                </div>

                                {/* CTA */}
                                <Link
                                    to={plan.cta}
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition-colors text-center block ${
                                        plan.buttonStyle === 'primary'
                                            ? 'bg-primary text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30'
                                            : plan.id === 'agency_enterprise'
                                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                                >
                                    {plan.buttonText}
                                </Link>

                                {/* Trial note */}
                                {plan.id !== 'agency_enterprise' && (
                                    <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium -mt-3">
                                        ✓ 15-day free trial included
                                    </p>
                                )}

                                {/* Feature list */}
                                <div className="flex flex-col gap-3">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                                            <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                                                {plan.popular ? 'check_circle' : 'check'}
                                            </span>
                                            <span className={feature.highlighted ? 'font-bold' : ''}>{feature.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Social Proof ── */}
                <div className="w-full px-4 py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                    <div className="max-w-[960px] mx-auto flex flex-col gap-12">
                        {/* Trust Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            <div className="flex flex-col gap-2">
                                <p className="text-3xl md:text-4xl font-black text-primary">500+</p>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Consultants</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-3xl md:text-4xl font-black text-primary">50K+</p>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Cases Managed</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-3xl md:text-4xl font-black text-primary">4.9</p>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Star Rating</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-3xl md:text-4xl font-black text-primary">24h</p>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Support</p>
                            </div>
                        </div>

                        {/* Testimonial */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <span key={i} className="text-yellow-400 material-symbols-outlined text-[20px]">star</span>
                                    ))}
                                </div>
                            </div>
                            <p className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                                "Immizy helped me organize 100+ cases and close them faster. The automation features save me 10 hours every week. Worth every rupee."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="text-primary font-bold">MS</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">Maria Sharma</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Immigration Attorney, Mumbai</p>
                                </div>
                            </div>
                        </div>

                        {/* Security Badges */}
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Trusted & Secure</p>
                            <div className="flex items-center justify-center gap-8 flex-wrap">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                        <span className="text-blue-600 text-xl">🛡️</span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">GDPR Compliant</p>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                        <span className="text-green-600 text-xl">✔️</span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">SOC 2 Type II</p>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                        <span className="text-purple-600 text-xl">🔒</span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Bank-level Encryption</p>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                                        <span className="text-orange-600 text-xl">📋</span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">ISO 27001</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Comparison Table ── */}
                <div className="w-full px-4 md:px-10 lg:px-20 py-16 bg-white dark:bg-slate-900/50">
                    <div className="max-w-[960px] mx-auto flex flex-col gap-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white text-center">
                            Compare Features
                        </h2>

                        {planType === 'individual' ? (
                            /* Individual comparison table */
                            <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[480px]">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white w-2/5">Feature</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white w-1/5">Solo Basic</th>
                                                <th className="px-6 py-4 text-center text-sm font-bold text-primary w-1/5">Solo Pro</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                            {individualComparison.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{row.name}</td>
                                                    <td className="px-6 py-4 text-sm text-center text-slate-600 dark:text-slate-400">
                                                        <IconCell value={row.basic} />
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-center font-bold text-slate-900 dark:text-white">
                                                        <IconCell value={row.pro} highlight />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            /* Agency comparison table */
                            <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[600px]">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white w-1/3">Feature</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white w-1/5">Starter</th>
                                                <th className="px-6 py-4 text-center text-sm font-bold text-primary w-1/5">Growth</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white w-1/5">Enterprise</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                            {agencyComparison.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{row.name}</td>
                                                    <td className="px-6 py-4 text-sm text-center text-slate-600 dark:text-slate-400">
                                                        <IconCell value={row.starter} />
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-center font-bold text-slate-900 dark:text-white">
                                                        <IconCell value={row.growth} highlight />
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-center text-slate-600 dark:text-slate-400">
                                                        <IconCell value={row.enterprise} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── FAQ ── */}
                <div className="w-full px-4 md:px-20 py-16">
                    <div className="max-w-[800px] mx-auto">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                            Frequently Asked Questions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="flex flex-col gap-2">
                                    <h4 className="font-bold text-slate-900 dark:text-white">{faq.question}</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Bottom CTA ── */}
                <div className="w-full px-4 py-8 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                    <div className="max-w-[960px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Still have questions?</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Our sales team is ready to help you find the perfect fit.</p>
                        </div>
                        <Link
                            to="/help"
                            className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-bold px-6 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                        >
                            Contact Sales
                        </Link>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    )
}
