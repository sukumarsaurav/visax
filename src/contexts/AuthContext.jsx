import { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { getDashboardPath as resolveDashboardPath } from '../constants/rolePolicy'
import * as profilesRepo from '../data/profilesRepo'
import { useSessionWarning } from '../hooks/useSessionWarning'
import { setUser as setReporterUser } from '../lib/errorReporter'

const AuthContext = createContext(null)

/**
 * Auth state owner. Responsibilities are intentionally narrow:
 *   - Track session + profile via Supabase's onAuthStateChange.
 *   - Expose auth mutations (signUp, signIn, signOut, resetPassword, updateProfile).
 *   - Expose role-derived dashboard path (delegates to rolePolicy).
 *
 * Side-effects that *react to* auth state (session expiry warning, activity
 * tracking, page-view tracking, etc.) live in their own hooks/components so
 * the provider stays composable.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const fetchingProfileRef = useRef(false)

    useEffect(() => {
        let lastUserId = null
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession ?? null)
            setUser(newSession?.user ?? null)
            if (newSession?.user) {
                // Skip refetch on TOKEN_REFRESHED (same user).
                if (lastUserId !== newSession.user.id) {
                    lastUserId = newSession.user.id
                    fetchProfile(newSession.user.id)
                }
            } else {
                lastUserId = null
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    // Session expiry warning lives in its own hook — no more toast UX in
    // the auth provider.
    useSessionWarning(session)

    async function fetchProfile(userId) {
        if (fetchingProfileRef.current) return
        fetchingProfileRef.current = true
        const { data, error } = await profilesRepo.getAuthProfile(userId)
        if (!error && data) {
            setProfile(data)
            // Tag all subsequent error reports with the authenticated user.
            setReporterUser({ id: data.id, email: data.email, role: data.role })
        }
        setLoading(false)
        fetchingProfileRef.current = false
    }

    async function signUp({ email, password, fullName, role = 'client' }) {
        return supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName, role } },
        })
    }

    async function signIn({ email, password }) {
        return supabase.auth.signInWithPassword({ email, password })
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        setProfile(null)
        setReporterUser(null)  // clear error reporter user context on sign-out
        return { error }
    }

    async function resetPassword(email) {
        return supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })
    }

    const refreshSession = useCallback(async () => {
        const { data, error } = await supabase.auth.refreshSession()
        if (!error && data?.session) setSession(data.session)
        return { data, error }
    }, [])

    async function updateProfile(updates) {
        const { data, error } = await profilesRepo.update(user.id, updates)
        if (!error && data) setProfile(data)
        return { data, error }
    }

    // Profile-aware dashboard redirect. All role branching lives in rolePolicy.
    const getDashboardPath = useCallback(() => resolveDashboardPath(profile), [profile])

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
    // signUp/signIn/signOut/resetPassword/updateProfile are defined inline
    // and recreated each render, but their behaviour is stable (they only
    // close over latest state setters / module-level supabase). Consumers
    // never use them as identity, so omitting from deps is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [user, profile, loading, refreshSession, getDashboardPath])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
