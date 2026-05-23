import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import OfflineBanner from './components/OfflineBanner'
import { Toaster } from 'react-hot-toast'
import { initErrorReporter } from './lib/errorReporter'

initErrorReporter()

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ErrorBoundary>
            <AuthProvider>
                <OfflineBanner />
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            borderRadius: '10px',
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '14px',
                            fontWeight: '600',
                        },
                        success: { iconTheme: { primary: '#136dec', secondary: '#fff' } },
                    }}
                />
            </AuthProvider>
        </ErrorBoundary>
    </StrictMode>,
)
