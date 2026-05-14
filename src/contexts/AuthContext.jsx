import { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { ROLE_DASHBOARD_PATHS } from '../constants/roles'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

const SESSION_WARNING_MS = 5 * 60 * 1000 // 5 minutes before expiry

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const warningTimerRef = useRef(null)
    const lastActivityRef = useRef(Date.now())

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
                scheduleWarning(session)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
                scheduleWarning(session)
            } else {
                setProfile(null)
                setLoading(false)
                clearTimeout(warningTimerRef.current)
            }
        })

        return () => {
            subscription.unsubscribe()
            clearTimeout(warningTimerRef.current)
        }
    }, [])

    // Track user activity
    useEffect(() => {
        function handleActivity() {
            lastActivityRef.current = Date.now()
        }
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
        events.forEach(e => document.addEventListener(e, handleActivity, { passive: true }))
        return () => events.forEach(e => document.removeEventListener(e, handleActivity))
    }, [])

    function scheduleWarning(session) {
        clearTimeout(warningTimerRef.current)
        if (!session?.expires_at) return

        const expiresAtMs = session.expires_at * 1000
        const warningAt = expiresAtMs - SESSION_WARNING_MS
        const delay = warningAt - Date.now()

        if (delay <= 0) return // Already past warning window

        warningTimerRef.current = setTimeout(() => {
            // Check if user was recently active (within last 10 min)
            const idleMs = Date.now() - lastActivityRef.current
            if (idleMs < 10 * 60 * 1000) {
                // User is active — auto-refresh silently
                refreshSession()
            } else {
                // User is idle — show warning toast
                toast(
                    (t) => (
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-amber-500">timer</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">Session expiring soon</p>
                                <p className="text-xs text-slate-500">Click to stay signed in</p>
                            </div>
                            <button
                                onClick={() => { refreshSession(); toast.dismiss(t.id) }}
                                className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors"
                            >
                                Stay
                            </button>
                        </div>
                    ),
                    { duration: 30000, position: 'top-right' }
                )
            }
        }, delay)
    }

    const refreshSession = useCallback(async () => {
        const { data, error } = await supabase.auth.refreshSession()
        if (!error && data?.session) {
            scheduleWarning(data.session)
        }
    }, [])

    const fetchingProfileRef = useRef(false)
    async function fetchProfile(userId) {
        if (fetchingProfileRef.current) return
        fetchingProfileRef.current = true
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (!error && data) setProfile(data)
        setLoading(false)
        fetchingProfileRef.current = false
    }

    async function signUp({ email, password, fullName, role = 'client' }) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, role },
            },
        })
        return { data, error }
    }

    async function signIn({ email, password }) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        return { data, error }
    }

    async function signOut() {
        clearTimeout(warningTimerRef.current)
        const { error } = await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        return { error }
    }

    async function resetPassword(email) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })
        return { data, error }
    }

    async function updateProfile(updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single()

        if (!error && data) setProfile(data)
        return { data, error }
    }

    // Derive the portal route from role — professionals get onboarding redirects
    function getDashboardPath() {
        if (!profile) return '/'

        // Professional accounts: check application status and onboarding
        if (profile.role === 'individual' || profile.role === 'agency_admin') {
            if (profile.application_status === 'pending_review') {
                return '/professional-submitted'
            }
            if (
                (profile.application_status === 'approved' || profile.application_status === 'active') &&
                profile.professional_onboarding_complete === false
            ) {
                return '/professional-approved'
            }
        }

        return ROLE_DASHBOARD_PATHS[profile.role] || '/'
    }

    const value = useMemo(() => ({
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        refreshSession,
        getDashboardPath,
        isAuthenticated: !!user,
        role: profile?.role,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [user, profile, loading, refreshSession])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}

