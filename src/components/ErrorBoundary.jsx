import { Component } from 'react'
import { report } from '../lib/errorReporter'

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, info) {
        // eslint-disable-next-line no-console
        console.error('Immizy ErrorBoundary caught:', error, info)
        report(error, { boundary: 'root', componentStack: info?.componentStack })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-background-light p-6 dark:bg-background-dark">
                    <div className="flex flex-col items-center gap-6 text-center max-w-md">
                        <div className="flex size-20 items-center justify-center rounded-3xl bg-red-100 dark:bg-red-900/30">
                            <span className="material-symbols-outlined material-filled text-[48px] text-red-500">
                                error
                            </span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Something went wrong</h2>
                            <p className="mt-2 text-sm text-slate-500">
                                An unexpected error occurred. Please refresh the page to try again.
                            </p>
                            {this.state.error?.message && (
                                <pre className="mt-3 rounded-lg bg-slate-100 p-3 text-left text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400 overflow-auto max-h-32">
                                    {this.state.error.message}
                                </pre>
                            )}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90"
                        >
                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                            Reload Page
                        </button>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}
