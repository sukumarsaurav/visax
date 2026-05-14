import { clsx } from '../../utils/clsx'

export default function ToggleSwitch({ checked, onChange, label, disabled = false, className = '' }) {
    return (
        <label className={clsx('inline-flex items-center gap-2 cursor-pointer', { 'opacity-50 cursor-not-allowed': disabled }, className)}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={clsx(
                    'relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus-ring',
                    checked ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                )}
            >
                <span
                    className={clsx(
                        'inline-block h-4 w-4 transform rounded-full bg-white shadow transition',
                        checked ? 'translate-x-4' : 'translate-x-0'
                    )}
                />
            </button>
            {label && <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>}
        </label>
    )
}
