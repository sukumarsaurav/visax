import Button from '../../../components/ui/Button'

/**
 * Filter controls (languages + price range). Used in two slots: the
 * desktop sidebar and the mobile drawer. Both pass the same props.
 */
export default function FilterPanel({
    availableLanguages,
    selectedLanguages,
    onToggleLanguage,
    minPrice,
    maxPrice,
    onMinPriceChange,
    onMaxPriceChange,
    onClear,
    onApply,                // present only in mobile sheet
    variant = 'sidebar',    // 'sidebar' | 'sheet'
}) {
    const hasFilters = selectedLanguages.length > 0 || minPrice || maxPrice
    const isSheet = variant === 'sheet'

    return (
        <div className={isSheet ? 'p-6 flex flex-col gap-8' : 'flex flex-col gap-6'}>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-3">Languages</h4>
                <div className="flex flex-col gap-2">
                    {availableLanguages.map(lang => (
                        <label key={lang} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedLanguages.includes(lang)}
                                onChange={() => onToggleLanguage(lang)}
                                className="size-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-300">{lang}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-3">Price Range ($/hr)</h4>
                <div className="flex items-center gap-2">
                    <input
                        type="number" placeholder="Min" value={minPrice}
                        onChange={e => onMinPriceChange(e.target.value)}
                        className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none dark:text-white"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                        type="number" placeholder="Max" value={maxPrice}
                        onChange={e => onMaxPriceChange(e.target.value)}
                        className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none dark:text-white"
                    />
                </div>
            </div>

            {isSheet ? (
                <div className="flex gap-3 mt-4">
                    {hasFilters && (
                        <Button variant="outline" className="flex-1" onClick={onClear}>Clear All</Button>
                    )}
                    <Button className="flex-1" onClick={onApply}>Apply Filters</Button>
                </div>
            ) : (
                hasFilters && (
                    <button
                        onClick={onClear}
                        className="text-sm text-primary font-medium hover:underline text-left"
                    >
                        Clear Filters
                    </button>
                )
            )}
        </div>
    )
}
