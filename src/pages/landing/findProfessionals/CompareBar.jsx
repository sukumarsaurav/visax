import Button from '../../../components/ui/Button'

/** Floating "compare 2-4 selected" bar — hidden when fewer than 2 are picked. */
export default function CompareBar({ count, onCompare, onClear }) {
    if (count < 2) return null
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-[slideUp_0.3s_ease-out]">
            <span className="material-symbols-outlined text-primary text-[20px]">compare</span>
            <span className="text-sm font-medium">{count} professionals selected</span>
            <Button size="sm" onClick={onCompare}>Compare Now</Button>
            <button
                onClick={onClear}
                className="text-slate-400 hover:text-white transition-colors ml-1"
                aria-label="Clear comparison selection"
            >
                <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
        </div>
    )
}
