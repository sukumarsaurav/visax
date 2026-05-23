import { Component } from 'react'
import Button from './ui/Button'
import { report } from '../lib/errorReporter'

/**
 * Per-route error boundary — catches errors within a dashboard page
 * while keeping the sidebar/header visible.
 *
 * Unlike the global ErrorBoundary, this offers a "Retry" button that
 * re-mounts the child component without a full page reload.
 */
export default class RouteErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, info) {
        // eslint-disable-next-line no-console
        console.error('RouteErrorBoundary caught:', error, info)
        report(error, { boundary: 'route', componentStack: info?.componentStack })
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center gap-6 py-20 text-center">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
                        <span className="material-symbols-outlined text-[36px] text-red-500" aria-hidden="true">
                            warning
                        </span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Something went wrong
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            This page encountered an error. Your other pages and navigation still work normally.
                        </p>
                        {this.state.error?.message && (
                            <pre className="mt-3 mx-auto rounded-lg bg-slate-100 p-3 text-left text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400 overflow-auto max-h-24 max-w-lg">
                                {this.state.error.message}
                            </pre>
                        )}
                    </div>
                    <Button
                        icon="refresh"
                        onClick={this.handleRetry}
                    >
                        Retry
                    </Button>
                </div>
            )
        }
        return this.props.children
    }
}
