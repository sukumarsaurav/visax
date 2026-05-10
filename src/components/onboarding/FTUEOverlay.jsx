import { useFTUE } from './FTUEProvider'

export default function FTUEOverlay() {
    const { isActive } = useFTUE()

    if (!isActive) return null

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-40 transition-opacity duration-300"
            aria-hidden="true"
        />
    )
}
