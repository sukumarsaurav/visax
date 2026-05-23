import { useState } from 'react'
import { useSEO } from '../../hooks/useSEO'
import { SEO } from '../../lib/seo'
import { Link } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'

// Plan prices are quoted in INR. These MUST match:
//   • src/pages/auth/ProfessionalRegisterPage.jsx → agencyPlans[].price
//   • supabase/functions/create-razorpay-order/index.ts → PLANS[].price_inr
// Yearly = monthly × 10 (i.e. 2 months free), the standard SaaS discount.
const plans = [
    {
        id: 'starter',
        name: 'Starter',
        description: 'Perfect for small firms just getting started.',
        monthlyPrice: 4999,
        yearlyPrice: 49990,        // ~₹4,166/mo equivalent
        features: [
            { text: 'Up to 3 Consultant Seats', highlighted: false },
            { text: '50 Cases / month', highlighted: false },
            { text: 'Basic Analytics', highlighted: false },
            { text: 'Email Support', highlighted: false }
        ],
        buttonText: 'Get Started',
        buttonStyle: 'secondary',
        cta: '/professional-register',
        popular: false
    },
    {
        id: 'growth',
        name: 'Growth',
        description: 'For expanding agencies with active caseloads.',
        monthlyPrice: 8999,
        yearlyPrice: 89990,        // ~₹7,499/mo equivalent
        features: [
            { text: 'Up to 15 Consultant Seats', highlighted: true },
            { text: '250 Cases / month', highlighted: true },
            { text: 'Advanced Reporting', highlighted: false },
            { text: 'Priority Support', highlighted: false },
            { text: 'Custom Branding', highlighted: false }
        ],
        buttonText: 'Start with Growth',
        buttonStyle: 'primary',
        cta: '/professional-register',
        popular: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Full-scale for large multinational firms.',
        monthlyPrice: 14999,
        yearlyPrice: 149990,       // ~₹12,499/mo equivalent
        features: [
            { text: 'Unlimited Consultant Seats', highlighted: false },
            { text: 'Unlimited Cases', highlighted: false },
            { text: 'Dedicated Account Manager', highlighted: false },
            { text: 'API Access', highlighted: false },
            { text: 'SSO Integration', highlighted: false }
        ],
        buttonText: 'Contact Sales',
        buttonStyle: 'secondary',
        cta: '/support#contact',
        popular: false
    }
]

const comparisonFeatures = [
    { name: 'Team Members', starter: '3 Users', growth: '15 Users', enterprise: 'Unlimited' },
    { name: 'Active Cases', starter: '50 / mo', growth: '250 / mo', enterprise: 'Unlimited' },
    { name: 'Document Storage', starter: 'check', growth: 'check_circle', enterprise: 'check_circle' },
    { name: 'API Access', starter: 'remove', growth: 'remove', enterprise: 'check_circle' },
    { name: 'Priority Support', starter: 'remove', growth: 'check_circle', enterprise: 'check_circle' },
    { name: 'Custom Branding', starter: 'remove', growth: 'check_circle', enterprise: 'check_circle' }
]

const faqs = [
    { question: 'Can I change plans later?', answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be applied to your next billing cycle.' },
    { question: 'What payment methods do you accept?', answer: 'Payments are processed securely via Razorpay. We accept all major Indian credit & debit cards (Visa, Mastercard, RuPay), UPI (Google Pay, PhonePe, Paytm), Netbanking from 50+ banks, and EMI options on select cards. International cards are supported for Enterprise plans.' },
    { question: 'Are prices inclusive of GST?', answer: 'Listed prices are exclusive of 18% GST. GST will be added at checkout and a tax invoice will be issued.' },
    { question: 'Do you offer a refund policy?', answer: 'Yes — we offer a 7-day money-back guarantee on the Starter and Growth plans, no questions asked. Enterprise refunds are handled per the contractual terms.' },
    { question: 'Do you offer discounts for non-profits or educational institutions?', answer: 'Yes! Contact our sales team with proof of status for a 20% discount on all plans.' },
    { question: 'Can I pay annually instead of monthly?', answer: 'Yes — choosing annual billing gives you 2 months free (effectively ~16% discount) on Starter and Growth plans.' }
]

export default function PricingPage() {
    useSEO(SEO.pricing)
    const [billingPeriod, setBillingPeriod] = useState('monthly')

    // Yearly displays the per-month equivalent (yearlyPrice / 12) so users can
    // compare like-for-like vs the monthly column. The full yearly amount is
    // shown below in small text via getPeriodLabel().
    const getPrice = (plan) => {
        if (plan.monthlyPrice === 0) return 0
        return billingPeriod === 'yearly'
            ? Math.round(plan.yearlyPrice / 12)
            : plan.monthlyPrice
    }

    const getPeriodLabel = (plan) => {
        if (plan.monthlyPrice === 0) return 'forever'
        return billingPeriod === 'yearly'
            ? `/mo · billed ₹${plan.yearlyPrice.toLocaleString('en-IN')}/yr`
            : '/mo'
    }

    const formatINR = (n) => n.toLocaleString('en-IN')

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            <PublicHeader />

            <main className="flex-1">
                {/* Header Section */}
                <div className="w-full px-4 md:px-20 py-12 flex flex-col items-center justify-center text-center">
                    <div className="max-w-[960px] flex flex-col items-center gap-4">
                        <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-normal leading-normal max-w-2xl">
                            Choose the plan that fits your growth. Manage more cases, collaborate with your team, and scale efficiently.
                        </p>
                    </div>
                </div>

                {/* Billing Toggle */}
                <div className="w-full flex justify-center px-4 pb-10">
                    <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-xl inline-flex">
                        <button
                            onClick={() => setBillingPeriod('monthly')}
                            className={`px-6 py-2 rounded-lg transition-all text-sm font-bold ${billingPeriod === 'monthly'
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                                    : 'text-slate-500 dark:text-slate-400'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingPeriod('yearly')}
                            className={`px-6 py-2 rounded-lg transition-all text-sm font-bold ${billingPeriod === 'yearly'
                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                                    : 'text-slate-500 dark:text-slate-400'
                                }`}
                        >
                            Yearly <span className="text-primary text-xs ml-1 font-extrabold">2 months free</span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="w-full px-4 md:px-10 lg:px-20 pb-12">
                    <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col gap-6 rounded-2xl p-8 shadow-sm transition-transform hover:-translate-y-1 ${plan.popular
                                        ? 'border-2 border-primary bg-white dark:bg-slate-800 shadow-xl transform md:scale-105 z-10'
                                        : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                                        Most Popular
                                    </div>
                                )}
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-slate-900 dark:text-white text-xl font-bold">{plan.name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">{plan.description}</p>
                                    <div className="flex flex-col gap-1 mt-2">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-slate-900 dark:text-white text-4xl font-black tracking-tight">
                                                ₹{formatINR(getPrice(plan))}
                                            </span>
                                            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">{getPeriodLabel(plan)}</span>
                                        </div>
                                        <span className="text-xs text-slate-400 dark:text-slate-500">Exclusive of 18% GST</span>
                                    </div>
                                </div>
                                <Link to={plan.cta} className={`w-full py-3 rounded-xl font-bold text-sm transition-colors text-center block ${plan.buttonStyle === 'primary'
                                        ? 'bg-primary text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}>
                                    {plan.buttonText}
                                </Link>
                                <div className="flex flex-col gap-3">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                                            <span className={`material-symbols-outlined text-primary text-[20px]`}>
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

                {/* Comparison Table */}
                <div className="w-full px-4 md:px-10 lg:px-20 py-16 bg-white dark:bg-slate-900/50">
                    <div className="max-w-[960px] mx-auto flex flex-col gap-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white text-center">Compare Features</h2>
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
                                        {comparisonFeatures.map((feature, idx) => (
                                            <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{feature.name}</td>
                                                <td className="px-6 py-4 text-sm text-center text-slate-600 dark:text-slate-400">
                                                    {['check', 'check_circle', 'remove'].includes(feature.starter) ? (
                                                        <span className={`material-symbols-outlined text-xl ${feature.starter === 'remove' ? 'text-slate-300 dark:text-slate-600' : 'text-primary'
                                                            }`}>{feature.starter}</span>
                                                    ) : feature.starter}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center font-bold text-slate-900 dark:text-white">
                                                    {['check', 'check_circle', 'remove'].includes(feature.growth) ? (
                                                        <span className={`material-symbols-outlined text-xl ${feature.growth === 'remove' ? 'text-slate-300 dark:text-slate-600' : 'text-primary'
                                                            }`}>{feature.growth}</span>
                                                    ) : feature.growth}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center text-slate-600 dark:text-slate-400">
                                                    {['check', 'check_circle', 'remove'].includes(feature.enterprise) ? (
                                                        <span className={`material-symbols-outlined text-xl ${feature.enterprise === 'remove' ? 'text-slate-300 dark:text-slate-600' : 'text-primary'
                                                            }`}>{feature.enterprise}</span>
                                                    ) : feature.enterprise}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="w-full px-4 md:px-20 py-16">
                    <div className="max-w-[800px] mx-auto">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">Frequently Asked Questions</h2>
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

                {/* Bottom CTA */}
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
