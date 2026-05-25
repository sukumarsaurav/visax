import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

/**
 * Check trial status for the current user.
 *
 * Return shape:
 *   isOnTrial      – boolean: user is in active trial
 *   daysRemaining  – number: days left (null if not on trial)
 *   trialEndsAt    – date: when trial expires (null if not on trial)
 *   isExpired      – boolean: trial has ended
 *   refetchStatus  – function: re-check trial status
 */
export function useTrialStatus() {
    const { profile } = useAuth()
    const [trialStatus, setTrialStatus] = useState({
        isOnTrial: false,
        daysRemaining: null,
        trialEndsAt: null,
        isExpired: false,
    })
    const [loading, setLoading] = useState(true)

    const fetchTrialStatus = useCallback(async () => {
        if (!profile?.id) {
            setLoading(false)
            return
        }

        setLoading(true)
        const { data, error } = await supabase
            .from('profiles')
            .select('trial_starts_at, trial_ends_at, trial_expired, role')
            .eq('id', profile.id)
            .single()

        if (error) {
            console.error('Error fetching trial status:', error)
            setLoading(false)
            return
        }

        if (!data || data.role !== 'individual') {
            setTrialStatus({
                isOnTrial: false,
                daysRemaining: null,
                trialEndsAt: null,
                isExpired: false,
            })
            setLoading(false)
            return
        }

        const trialEndsAt = data.trial_ends_at ? new Date(data.trial_ends_at) : null
        const now = new Date()
        const isExpired = data.trial_expired || (trialEndsAt && trialEndsAt < now)
        const isOnTrial = !isExpired && trialEndsAt && trialEndsAt > now

        let daysRemaining = null
        if (trialEndsAt && !isExpired) {
            const diff = trialEndsAt - now
            daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24))
        }

        setTrialStatus({
            isOnTrial,
            daysRemaining,
            trialEndsAt,
            isExpired,
        })
        setLoading(false)
    }, [profile?.id])

    useEffect(() => {
        fetchTrialStatus()
    }, [fetchTrialStatus])

    return {
        ...trialStatus,
        loading,
        refetchStatus: fetchTrialStatus,
    }
}

/**
 * Format trial status for display.
 * Usage: formatTrialStatus({ daysRemaining: 5, isExpired: false })
 * Returns: "5 days left in your trial"
 */
export function formatTrialStatus(status) {
    if (status.isExpired) {
        return 'Your trial has ended'
    }
    if (!status.isOnTrial || status.daysRemaining === null) {
        return null
    }

    if (status.daysRemaining === 0) {
        return 'Your trial ends today'
    }
    if (status.daysRemaining === 1) {
        return '1 day left in your trial'
    }
    if (status.daysRemaining <= 3) {
        return `⚠️ ${status.daysRemaining} days left in your trial`
    }
    return `${status.daysRemaining} days left in your trial`
}
