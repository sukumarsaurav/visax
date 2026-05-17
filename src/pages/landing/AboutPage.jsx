import { Link } from 'react-router-dom'
import { useSEO } from '../../hooks/useSEO'
import { SEO } from '../../lib/seo'

const values = [
    { icon: 'verified_user', title: 'Trust & Transparency', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', desc: 'Every professional on our platform is verified. We publish credentials, reviews, and success rates so you can choose with confidence.' },
    { icon: 'school', title: 'Expertise First', color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400', desc: 'We work only with licensed immigration consultants, accredited representatives, and attorneys — never unqualified "notarios".' },
    { icon: 'public', title: 'Accessibility', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400', desc: 'Immigration help should not be a privilege. We offer services at multiple price points and in dozens of languages.' },
    { icon: 'favorite', title: 'Human-Centered', color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400', desc: 'Behind every case is a family, a dream, a life story. We build tools that honor that — not just paperwork processors.' },
]

const stats = [
    { value: '500+', label: 'Verified Professionals' },
    { value: '10k+', label: 'Clients Served' },
    { value: '98%', label: 'Success Rate' },
    { value: '40+', label: 'Countries Supported' },
]

const team = [
    { name: 'Arjun Mehta', role: 'CEO & Co-founder', initials: 'AM', color: 'from-violet-500 to-blue-500', bio: 'Former immigration attorney with 15 years of experience. Personally navigated the H-1B process four times.' },
    { name: 'Sofia Reyes', role: 'CTO & Co-founder', initials: 'SR', color: 'from-emerald-500 to-teal-500', bio: 'Built data platforms at two YC-backed startups. Arrived in the US on a student visa from Mexico City.' },
    { name: 'David Park', role: 'Head of Trust & Safety', initials: 'DP', color: 'from-amber-500 to-orange-500', bio: 'Former government policy advisor specializing in immigration fraud prevention and professional licensing.' },
    { name: 'Ama Owusu', role: 'Head of Partnerships', initials: 'AO', color: 'from-rose-500 to-pink-500', bio: 'Built the professional network at two legal-tech companies. Fluent in English, French, and Twi.' },
]

export default function AboutPage() {
    useSEO(SEO.about)
    return (
        <div className="min-h-screen bg-white dark:bg-[#0d1117]">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#0d1b2e] via-[#0f2a4a] to-[#0d1b2e] text-white py-24 px-6">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 20%, #6366f1 0%, transparent 40%)' }} />
                <div className="relative max-w-4xl mx-auto text-center">
                    <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-blue-300 uppercase mb-4">
                        <span className="material-symbols-outlined text-[16px]">flight_takeoff</span>
                        Our Story
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
                        Built for Immigrants.<br />
                        <span className="text-blue-400">Powered by Experts.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        We started Immizy because navigating immigration felt impossibly hard — even for people who work in the industry. We decided to change that.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Our Mission</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                            Immizy exists to make quality immigration guidance accessible to everyone — regardless of where you are in the world, how much you earn, or what language you speak.
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                            Immigration is one of the most consequential decisions a person makes. Yet millions of people face it alone, misled by unqualified "consultants" or buried in bureaucratic paperwork.
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            We built a platform that connects people with verified, licensed professionals — and gives both sides the tools to work together efficiently, transparently, and with peace of mind.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {stats.map(({ value, label }) => (
                            <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 text-center border border-slate-100 dark:border-slate-700">
                                <p className="text-3xl font-black text-primary mb-1">{value}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 px-6 bg-slate-50 dark:bg-slate-900/50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">What We Stand For</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Our values aren't on a wall — they're in every product decision we make.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {values.map(({ icon, title, color, desc }) => (
                            <div key={title} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex gap-4">
                                <div className={`size-12 flex-shrink-0 rounded-xl flex items-center justify-center ${color}`}>
                                    <span className="material-symbols-outlined">{icon}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">The Team</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">We're immigrants, attorneys, engineers, and advocates — united by a shared belief that this process can be better.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {team.map(({ name, role, initials, color, bio }) => (
                            <div key={name} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col items-center text-center">
                                <div className={`size-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-black text-lg mb-3`}>
                                    {initials}
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{name}</h3>
                                <p className="text-xs text-primary font-semibold mb-2">{role}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{bio}</p>
                            </div>
                        ))}
                    </div>
                    <div className="text-center">
                        <p className="text-slate-500 dark:text-slate-400 mb-4">We're growing fast and always looking for mission-driven people.</p>
                        <Link to="/support#contact"
                            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">mail</span>
                            Get in Touch
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-gradient-to-br from-primary to-blue-700 text-white text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-black mb-4">Ready to start your journey?</h2>
                    <p className="text-blue-100 mb-8">Join thousands of people who have navigated immigration successfully with Immizy.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/find-professionals"
                            className="bg-white text-primary font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
                            Find a Professional
                        </Link>
                        <Link to="/professional-register"
                            className="border-2 border-white/50 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
                            Join as a Professional
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
