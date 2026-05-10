import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { useCases } from '../../hooks/useCases'

const statusColor = {
    draft: 'slate', in_progress: 'blue', under_review: 'blue',
    docs_pending: 'amber', action_required: 'orange',
    approved: 'green', rejected: 'red', closed: 'slate',
}

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CasesPage() {
    const { cases, loading } = useCases()

    return (
        <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">My Cases</h2>
                    <p className="text-sm text-slate-500">{cases.length} case{cases.length !== 1 ? 's' : ''} total</p>
                </div>
            </header>

            {loading ? (
                <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />)}
                </div>
            ) : cases.length === 0 ? (
                <Card>
                    <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                        <span className="material-symbols-outlined text-[52px]">folder_open</span>
                        <p className="font-semibold">No cases yet</p>
                        <p className="text-sm">Your consultant will create cases for your immigration journey</p>
                    </div>
                </Card>
            ) : (
                <div className="flex flex-col gap-4">
                    {cases.map(c => (
                        <Card key={c.id}>
                            <div className="flex items-start gap-4">
                                <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                    <span className="material-symbols-outlined text-[24px] text-primary">folder_shared</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">{c.title}</h3>
                                            <p className="text-sm text-slate-500">{c.case_number} {c.visa_type ? `· ${c.visa_type}` : ''}</p>
                                        </div>
                                        <Badge variant={statusColor[c.status] || 'slate'}>
                                            {c.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                    {c.description && (
                                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{c.description}</p>
                                    )}
                                    {/* Progress bar */}
                                    {c.progress != null && (
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-slate-500">Progress</span>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{c.progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700">
                                                <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${c.progress}%` }} />
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                        {c.consultant && (
                                            <span>Consultant: <strong className="text-slate-700 dark:text-slate-300">{c.consultant.full_name}</strong></span>
                                        )}
                                        {c.destination_country && (
                                            <span>Country: <strong className="text-slate-700 dark:text-slate-300">{c.destination_country}</strong></span>
                                        )}
                                        <span>Updated: {formatDate(c.updated_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
