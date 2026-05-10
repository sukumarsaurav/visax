import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            else setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    async function fetchProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (!error && data) setProfile(data)
        setLoading(false)
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

        const map = {
            client: '/client',
            individual: '/consultant',
            agency_admin: '/agency',
            agency_member: '/team-member',
            admin: '/admin',
        }
        return map[profile.role] || '/'
    }

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        getDashboardPath,
        isAuthenticated: !!user,
        role: profile?.role,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
