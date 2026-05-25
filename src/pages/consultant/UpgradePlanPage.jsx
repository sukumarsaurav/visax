import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import * as paymentsRepo from '../../data/paymentsRepo'

// Plan definitions — must match PricingPage & ProfessionalRegisterPage
const individualPlans = [
    {
        id: 'solo_basic',
        name: 'Solo Basic',
        description: 'Up to 10 cases & 10 clients',
        monthlyPrice: 499,
        maxCases: 10,
        maxClients: 10,
        features: ['10 Active Cases', '10 Clients', 'Client Portal', '2 GB Storage', 'Email Support'],
    },
    {
        id: 'solo_pro',
        name: 'Solo Pro',
        description: 'Up to 30 cases & 30 clients with advanced tools',
        monthlyPrice: 999,
        maxCases: 30,
        maxClients: 30,
        features: ['30 Active Cases', '30 Clients', 'Advanced Analytics', 'Invoicing', 'Custom Branding', 'Priority Support'],
        recommended: true,
    },
]

const agencyPlans = [
    {
        id: 'agency_starter',
        name: 'Starter',
        description: 'Up to 3 team members, 50 cases',
        monthlyPrice: 2999,
        maxTeamMembers: 3,
        maxCases: 50,
        features: ['3 Team Members', '50 Cases/month', 'Basic Analytics'],
    },
    {
        id: 'agency_growth',
        name: 'Growth',
        description: 'Up to 10 team members, 200 cases',
        monthlyPrice: 6999,
        maxTeamMembers: 10,
        maxCases: 200,
        features: ['10 Team Members', '200 Cases/month', 'Advanced Reporting', 'Custom Branding', 'Priority Support'],
        recommended: true,
    },
    {
        id: 'agency_enterprise',
        name: 'Enterprise',
        description: 'Full-scale for large firms',
        monthlyPrice: 14999,
        maxTeamMembers: null,
        maxCases: null,
        features: ['Unlimited Members', 'Unlimited Cases', 'API Access', 'SSO', 'Dedicated Account Manager'],
    },
]

function PlanCard({ plan, current = false, selected = false, onSelect = null, isUpgrade = false }) {
    const isCurrentOrHigher = current || selected

    return (
        <div
            onClick={onSelect}
            className={`relative rounded-2xl border-2 p-6 transition-all cursor-pointer ${
                current
                    ? 'border-primary bg-primary/5'
                    : selected
                    ? 'border-primary bg-primary/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-primary/50'
            }`}
        >
            {current && (
                <div className="absolute top-0 right-0">
                    <Badge variant="primary">Current Plan</Badge>
                </div>
            )}

            <div className="mb-4 pt-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plan.description}</p>
            </div>

            <div className="mb-6">
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                    ₹{plan.monthlyPrice.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">/month</p>
            </div>

            {isUpgrade && !current && (
                <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Pro-rated charge</p>
                    <p className="text-sm font-black text-emerald-900 dark:text-emerald-100">Calculate on next step →</p>
                </div>
            )}

            <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-[14px] text-emerald-600 flex-shrink-0 mt-0.5">check_circle</span>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            {!current && (
                <Button
                    className="w-full"
                    variant={selected ? 'primary' : 'secondary'}
                    disabled={!isUpgrade && !current}
                >
                    {current ? 'Current Plan' : selected ? 'Selected' : 'Choose Plan'}
                </Button>
            )}

            {current && (
                <Button className="w-full" disabled variant="secondary">
                    Current Plan
                </Button>
            )}
        </div>
    )
}

export default function UpgradePlanPage() {
    const navigate = useNavigate()
    const { profile, user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [upgrading, setUpgrading] = useState(false)

    const isIndividual = profile?.role === 'individual'
    const currentPlanId = profile?.plan_id || (isIndividual ? 'solo_basic' : 'agency_starter')
    const plans = isIndividual ? individualPlans : agencyPlans
    const currentPlan = plans.find(p => p.id === currentPlanId)

    useEffect(() => {
        setLoading(false)
    }, [])

    // Check if plan is an upgrade
    const isUpgrade = (planId) => {
        const newPlan = plans.find(p => p.id === planId)
        const curr = plans.find(p => p.id === currentPlanId)
        if (!newPlan || !curr) return false
        return newPlan.monthlyPrice > curr.monthlyPrice
    }

    const handleUpgrade = async (targetPlanId) => {
        if (!isUpgrade(targetPlanId)) {
            toast.error('You can only upgrade to a higher plan')
            return
        }

        setUpgrading(true)
        try {
            const plan = plans.find(p => p.id === targetPlanId)
            const currentAmount = currentPlan.monthlyPrice
            const newAmount = plan.monthlyPrice
            const proratedAmount = newAmount - currentAmount // Simplified pro-ration (full month difference)

            // Create payment intent for the pro-rated amount
            const idempotencyKey = paymentsRepo.newIdempotencyKey()
            const { data: intent } = await paymentsRepo.ensureIntent({
                userId: user.id,
                idempotencyKey,
                provider: 'razorpay',
                amount: proratedAmount,
                currency: 'INR',
                metadata: {
                    type: 'upgrade',
                    fromPlan: currentPlanId,
                    toPlan: targetPlanId,
                    source: 'upgrade-page',
                },
            })

            const intentId = intent?.id

            // Create order
            const { data: orderData, error: orderErr } = await supabase.functions.invoke('create-razorpay-order', {
                body: { planId: targetPlanId, userId: user.id, idempotencyKey },
            })

            if (orderErr || orderData?.error) {
                if (intentId) {
                    await paymentsRepo.setIntentStatus(intentId, 'failed', {
                        error_message: orderErr?.message || orderData?.error || 'order_creation_failed',
                    })
                }
                toast.error('Payment setup failed. Please try again.')
                return
            }

            // Open Razorpay modal
            const razorpayLoaded = await loadRazorpay()
            if (!razorpayLoaded) {
                toast.error('Could not load payment gateway. Please check your connection.')
                return
            }

            await new Promise((resolve, reject) => {
                const options = {
                    key: orderData.key_id,
                    amount: orderData.amount,
                    currency: 'INR',
                    name: 'Immizy',
                    description: `Upgrade to ${plan.name}`,
                    image: 'https://immizy.in/logo.png',
                    order_id: orderData.order_id,
                    handler: async (response) => {
                        try {
                            const { error: verifyErr } = await supabase.functions.invoke('verify-razorpay-payment', {
                                body: {
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                    userId: user.id,
                                    planId: targetPlanId,
                                    idempotencyKey,
                                },
                            })

                            if (verifyErr) throw new Error(verifyErr.message)

                            if (intentId) {
                                await paymentsRepo.setIntentStatus(intentId, 'succeeded', {
                                    provider_payment_id: response.razorpay_payment_id,
                                })
                            }

                            // Update user's plan
                            await supabase.from('profiles').update({ plan_id: targetPlanId }).eq('id', user.id)

                            toast.success(`Successfully upgraded to ${plan.name}!`)
                            navigate('/consultant/dashboard')
                            resolve()
                        } catch (e) {
                            if (intentId) {
                                await paymentsRepo.setIntentStatus(intentId, 'failed', {
                                    error_message: `verify_failed:${e.message}`,
                                    provider_payment_id: response.razorpay_payment_id,
                                })
                            }
                            reject(e)
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            if (intentId) {
                                paymentsRepo.setIntentStatus(intentId, 'cancelled')
                            }
                            reject(new Error('cancelled'))
                        },
                    },
                    prefill: {
                        name: profile?.full_name || '',
                        email: profile?.email || user.email || '',
                        contact: profile?.phone || '',
                    },
                    theme: { color: '#4F46E5' },
                }
                const rzp = new window.Razorpay(options)
                rzp.on('payment.failed', (r) => {
                    if (intentId) {
                        paymentsRepo.setIntentStatus(intentId, 'failed', {
                            error_message: r.error?.description || 'payment_failed',
                        })
                    }
                    reject(new Error(r.error?.description || 'Payment failed'))
                })
                rzp.open()
            })
        } catch (err) {
            if (err.message === 'cancelled') {
                toast('Payment cancelled. You can upgrade later.', { icon: '⚠️' })
            } else {
                toast.error(`Error: ${err.message || 'Something went wrong'}`)
            }
        } finally {
            setUpgrading(false)
        }
    }

    async function loadRazorpay() {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true)
                return
            }
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse">Loading...</div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                    Upgrade Your Plan
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                    Unlock more capacity and advanced features. Only pay the difference (pro-rated).
                </p>
            </div>

            {/* Current Plan Info */}
            <Card className="mb-8" title="Your Current Plan">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{currentPlan?.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            ₹{currentPlan?.monthlyPrice.toLocaleString('en-IN')}/month
                        </p>
                    </div>
                    <Badge variant="primary">Active</Badge>
                </div>
            </Card>

            {/* Plans Grid */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                    Choose Your New Plan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {plans.map((plan) => (
                        <div key={plan.id} onClick={() => plan.id !== currentPlanId && setSelectedPlan(plan.id)}>
                            <PlanCard
                                plan={plan}
                                current={plan.id === currentPlanId}
                                selected={plan.id === selectedPlan}
                                isUpgrade={isUpgrade(plan.id)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Action */}
            {selectedPlan && selectedPlan !== currentPlanId && (
                <div className="flex gap-4 justify-end">
                    <Button
                        variant="secondary"
                        onClick={() => setSelectedPlan(null)}
                        disabled={upgrading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => handleUpgrade(selectedPlan)}
                        disabled={!isUpgrade(selectedPlan) || upgrading}
                    >
                        {upgrading ? 'Processing...' : `Upgrade Now`}
                    </Button>
                </div>
            )}

            {/* Info Box */}
            <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    💡 About Pro-ration
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                    You'll only pay the difference between your current plan and the new plan. The charge is pro-rated based on remaining days in your billing cycle.
                </p>
            </div>
        </div>
    )
}
