import { useEffect } from 'react'

const LOCALE_KEY = 'visax-locale'

/**
 * Reads the user's stored locale preference and keeps document.documentElement.lang
 * in sync. Screen readers use this to pronounce content correctly.
 * Call setDocumentLang('hi') from any language-switch UI to activate Hindi mode.
 */
export function useDocumentLang() {
    useEffect(() => {
        const stored = localStorage.getItem(LOCALE_KEY)
        if (stored) {
            document.documentElement.setAttribute('lang', stored.startsWith('hi') ? 'hi' : 'en')
        }

        function handleStorage(e) {
            if (e.key === LOCALE_KEY) {
                document.documentElement.setAttribute('lang', e.newValue?.startsWith('hi') ? 'hi' : 'en')
            }
        }
        window.addEventListener('storage', handleStorage)
        return () => window.removeEventListener('storage', handleStorage)
    }, [])
}

export function setDocumentLang(locale) {
    localStorage.setItem(LOCALE_KEY, locale)
    document.documentElement.setAttribute('lang', locale.startsWith('hi') ? 'hi' : 'en')
}
