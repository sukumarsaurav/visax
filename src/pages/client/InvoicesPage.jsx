import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { useInvoices } from '../../hooks/useInvoices'
import { formatDate } from '../../utils/date'

const statusColor = { draft: 'slate', pending: 'amber', paid: 'green', overdue: 'red', cancelled: 'slate' }

export default function InvoicesPage() {
    const { invoices, loading } = useInvoices()

    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0)
    const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + Number(i.amount), 0)

    return (
        <div className="flex flex-col gap-6">
            <header>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Invoices</h2>
                <p className="text-sm text-slate-500">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p>
            </header>

            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <p className="text-sm font-semibold text-slate-500">Total Paid</p>
                    <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">${totalPaid.toFixed(2)}</p>
                </Card>
                <Card>
                    <p className="text-sm font-semibold text-slate-500">Pending</p>
                    <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">${totalPending.toFixed(2)}</p>
                </Card>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />)}
                </div>
            ) : invoices.length === 0 ? (
                <Card>
                    <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                        <span className="material-symbols-outlined text-[52px]">receipt_long</span>
                        <p className="font-semibold">No invoices yet</p>
                    </div>
                </Card>
            ) : (
                <Card>
                    <CardHeader><CardTitle>All Invoices</CardTitle></CardHeader>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {invoices.map(inv => (
                            <div key={inv.id} className="flex items-center gap-4 py-4 first:pt-2">
                                <div className={`flex size-10 flex-shrink-0 items-center justify-center rounded-lg ${inv.status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                                    <span className={`material-symbols-outlined text-[20px] ${inv.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {inv.status === 'paid' ? 'check_circle' : 'attach_money'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 dark:text-white">{inv.invoice_number}</p>
                                    <p className="text-xs text-slate-500">
                                        {inv.status === 'paid' ? `Paid ${formatDate(inv.paid_at)}` : inv.due_date ? `Due ${formatDate(inv.due_date)}` : 'No due date'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="font-bold text-slate-900 dark:text-white">${Number(inv.amount).toFixed(2)}</p>
                                    <Badge variant={statusColor[inv.status] || 'slate'}>{inv.status}</Badge>
                                </div>
                                {inv.status === 'pending' && (
                                    <button className="ml-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/90">
                                        Pay Now
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    )
}
