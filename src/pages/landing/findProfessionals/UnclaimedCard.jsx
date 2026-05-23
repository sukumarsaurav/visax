import { Link } from 'react-router-dom'

/** Single unclaimed-profile entry rendered in the "More consultants" grid. */
export default function UnclaimedCard({ profile }) {
    const initials = profile.full_name
        ?.split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    return (
        <Link
            to={`/consultant/unclaimed/${profile.id}`}
            className="group flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-800/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
            <div className="size-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                {profile.avatar_url
                    ? <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" loading="lazy" />
                    : initials}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{profile.full_name}</span>
                    <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full shrink-0">Unclaimed</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {profile.role === 'agency_admin' ? 'Agency' : 'Consultant'}
                    {profile.city ? ` · ${profile.city}` : ''}
                    {profile.years_experience > 0 ? ` · ${profile.years_experience}+ yrs` : ''}
                </p>
                {profile.specializations?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {profile.specializations.slice(0, 2).map(s => (
                            <span key={s} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">{s}</span>
                        ))}
                    </div>
                )}
            </div>
            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors text-[18px] shrink-0 mt-1">chevron_right</span>
        </Link>
    )
}
