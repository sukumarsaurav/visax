import { Link } from 'react-router-dom'
import Avatar from '../../../components/ui/Avatar'
import Button from '../../../components/ui/Button'

const TYPE_CONFIG = {
    individual:    { label: 'Individual Consultant', icon: 'person',    bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600' },
    agency_admin:  { label: 'Agency',                icon: 'apartment', bg: 'bg-indigo-50 dark:bg-indigo-900/20',  text: 'text-indigo-600' },
    agency_member: { label: 'Agency Member',         icon: 'badge',     bg: 'bg-purple-50 dark:bg-purple-900/20',  text: 'text-purple-600' },
}

/**
 * Marketplace search-result card. Pure presentational — receives all data
 * via props so the parent (FindProfessionalsPage) owns the data flow.
 */
export default function ProfessionalCard({
    pro,
    avgRating,
    reviewCount,
    minPrice,
    agencyInfo,
    memberAgency,
    inCompare,
    onToggleCompare,
}) {
    const typeConf = TYPE_CONFIG[pro.role] || TYPE_CONFIG.individual
    const link = pro.role === 'agency_admin' && agencyInfo ? `/agency/${agencyInfo.id}` : `/consultant/${pro.id}`
    const displayName = pro.role === 'agency_admin' && agencyInfo ? agencyInfo.name : pro.full_name

    return (
        <Link
            to={link}
            state={{ profile: pro }}
            className="group flex flex-col bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
        >
            {/* Type badge + rating + compare toggle */}
            <div className={`px-5 py-2 flex items-center justify-between ${typeConf.bg}`}>
                <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-sm ${typeConf.text}`}>{typeConf.icon}</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${typeConf.text}`}>{typeConf.label}</span>
                </div>
                {avgRating && (
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-400">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        <span className="text-xs font-bold">{avgRating}</span>
                        <span className="text-[10px]">({reviewCount})</span>
                    </div>
                )}
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onToggleCompare(pro.id)
                    }}
                    className={`flex items-center justify-center size-7 rounded-lg border transition-colors ${
                        inCompare
                            ? 'border-primary bg-primary text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-400 hover:border-primary hover:text-primary'
                    }`}
                    title={inCompare ? 'Remove from comparison' : 'Add to comparison'}
                    aria-label={`${inCompare ? 'Remove' : 'Add'} ${pro.full_name} ${inCompare ? 'from' : 'to'} comparison`}
                >
                    <span className="material-symbols-outlined text-[16px]">{inCompare ? 'check' : 'compare'}</span>
                </button>
            </div>

            <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex items-start gap-3">
                    {pro.role === 'agency_admin' ? (
                        <div className="size-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600">
                            <span className="material-symbols-outlined text-2xl text-slate-400">apartment</span>
                        </div>
                    ) : (
                        <Avatar src={pro.avatar_url} alt={pro.full_name} size="lg" />
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{displayName}</h3>
                        {pro.role === 'agency_admin' && agencyInfo && (
                            <p className="text-xs text-slate-500 mt-0.5">
                                <span className="material-symbols-outlined text-[12px] mr-1 align-text-top">groups</span>
                                {agencyInfo.memberCount} Consultants
                            </p>
                        )}
                        {pro.role === 'agency_member' && memberAgency && (
                            <p className="text-xs text-primary font-medium mt-0.5">@ {memberAgency.agencyName}</p>
                        )}
                        {pro.years_experience && (
                            <p className="text-xs text-slate-500 mt-0.5">{pro.years_experience} yrs experience</p>
                        )}
                    </div>
                </div>

                {pro.specializations?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {pro.specializations.slice(0, 3).map(s => (
                            <span key={s} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">{s}</span>
                        ))}
                    </div>
                )}

                {pro.languages?.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-[16px]">translate</span>
                        <span>{pro.languages.slice(0, 3).join(', ')}</span>
                    </div>
                )}

                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500">
                            {pro.role === 'agency_admin' ? 'Starting from' : 'Consultation'}
                        </p>
                        {minPrice != null ? (
                            <p className="font-bold text-slate-900 dark:text-white">
                                ${minPrice}<span className="text-xs font-normal text-slate-500">/hr</span>
                            </p>
                        ) : (
                            <p className="text-xs text-slate-400">Contact for pricing</p>
                        )}
                    </div>
                    <Button size="sm">
                        {pro.role === 'agency_admin' ? 'View Agency' : 'Book Now'}
                    </Button>
                </div>
            </div>
        </Link>
    )
}
