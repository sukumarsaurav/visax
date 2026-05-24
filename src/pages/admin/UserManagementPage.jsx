import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { supabase } from '../../lib/supabase'
import { slackNotify, mailchimpSync, trackEvent } from '../../lib/integrations'
import { friendlyError } from '../../lib/errors'
import { writeAuditLog } from '../../lib/auditLog'
import { useDebounce } from '../../hooks/useDebounce'
import * as profilesRepo from '../../data/profilesRepo'
import * as adminStatsRepo from '../../data/adminStatsRepo'

const ROLE_LABELS = { client: 'Client', individual: 'Consultant', agency_admin: 'Agency', agency_member: 'Team Member', admin: 'Admin' }
const ROLE_COLORS = { client: 'blue', individual: 'purple', agency_admin: 'emerald', agency_member: 'indigo', admin: 'red' }
const STATUS_LABELS = { active: 'Active', pending_review: 'Pending Review', inactive: 'Inactive', suspended: 'Suspended' }

const PAGE_SIZE = 10
const ROLE_FILTER = { 'All Users': null, 'Clients': 'client', 'Consultants': 'individual', 'Agencies': 'agency_admin' }

export default function UserManagementPage() {
    const [users, setUsers] = useState([])
    const [total, setTotal] = useState(0)
    const [kpi, setKpi] = useState({ pending_verification: 0, consultants: 0, agencies: 0 })
    const [loading, setLoading] = useState(true)
    const [kpiLoading, setKpiLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState('')
    const [activeFilter, setActiveFilter] = useState('All Users')
    const [selectedUser, setSelectedUser] = useState(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editForm, setEditForm] = useState({})
    const [confirm, setConfirm] = useState(null) // { action: 'suspend'|'unsuspend', label, message }
    // F-UM01: role-change requires explicit confirmation
    const [roleConfirm, setRoleConfirm] = useState(null) // { from, to, userName, userEmail }

    const debouncedSearch = useDebounce(search, 300)

    // ── KPI counts via RPC (single round-trip, server-side aggregates) ───────
    useEffect(() => {
        async function loadKpi() {
            setKpiLoading(true)
            const { data } = await adminStatsRepo.getDashboardStats()
            if (data) {
                setKpi({
                    pending_verification: Number(data.pending_verification || 0),
                    consultants: Number(data.consultants || 0),
                    agencies: Number(data.agencies || 0),
                })
            }
            setKpiLoading(false)
        }
        loadKpi()
    }, [])

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        const { data, count, error } = await profilesRepo.adminList({
            roleFilter: ROLE_FILTER[activeFilter],
            search: debouncedSearch,
            page,
            pageSize: PAGE_SIZE,
        })

        if (error) toast.error(friendlyError(error, 'Failed to load users'))
        setUsers(data || [])
        setTotal(count || 0)
        setLoading(false)
    }, [activeFilter, debouncedSearch, page])

    useEffect(() => { fetchUsers() }, [fetchUsers])

    const handleUserClick = (user) => {
        setSelectedUser(user)
        setEditForm({
            full_name: user.full_name || '',
            email: user.email,
            role: user.role,
            application_status: user.application_status || 'active',
            is_verified: user.is_verified,
        })
        setDrawerOpen(true)
    }

    const handleSave = () => {
        if (!selectedUser) return

        // F-UM01: any role change must be explicitly confirmed before committing
        if (editForm.role !== selectedUser.role) {
            setRoleConfirm({
                from: selectedUser.role,
                to: editForm.role,
                userName: selectedUser.full_name || selectedUser.email,
                userEmail: selectedUser.email,
            })
            return
        }
        doSave()
    }

    const doSave = async () => {
        if (!selectedUser) return
        setRoleConfirm(null)
        setSaving(true)
        const { error } = await profilesRepo.updateBare(selectedUser.id, {
            full_name: editForm.full_name,
            role: editForm.role,
            application_status: editForm.application_status,
            is_verified: editForm.is_verified,
        })

        if (error) {
            // Surface last-admin constraint from migration 012 with a clear message
            const msg = error.message?.includes('last platform administrator')
                ? error.message
                : friendlyError(error, 'Failed to save changes')
            toast.error(msg)
        } else {
            toast.success('User updated successfully')
            await writeAuditLog({
                action: 'User Updated',
                entityType: 'profile',
                entityId: selectedUser.id,
                // F-UM01: include previous_role so the audit trail shows the before/after
                details: {
                    previous_role: selectedUser.role,
                    role: editForm.role,
                    status: editForm.application_status,
                    is_verified: editForm.is_verified,
                },
            })
            if (selectedUser.email) {
                mailchimpSync({ email: selectedUser.email, full_name: editForm.full_name, role: editForm.role })
            }
            trackEvent('user_updated', { role: editForm.role })
            fetchUsers()
            setDrawerOpen(false)
        }
        setSaving(false)
    }

    const executeSuspend = async () => {
        if (!selectedUser) return
        setSaving(true)
        const newStatus = selectedUser.application_status === 'suspended' ? 'active' : 'suspended'
        const { error } = await profilesRepo.updateBare(selectedUser.id, { application_status: newStatus })

        if (error) {
            toast.error(friendlyError(error, 'Action failed'))
        } else {
            toast.success(`User ${newStatus === 'suspended' ? 'suspended' : 'reactivated'}`)
            await writeAuditLog({
                action: newStatus === 'suspended' ? 'User Suspended' : 'User Reactivated',
                entityType: 'profile',
                entityId: selectedUser.id,
                details: { previous_status: selectedUser.application_status, new_status: newStatus },
            })
            if (newStatus === 'suspended') {
                slackNotify('user.suspended', { name: selectedUser.full_name, email: selectedUser.email })
                trackEvent('user_suspended')
            }
            fetchUsers()
            setDrawerOpen(false)
        }
        setSaving(false)
        setConfirm(null)
    }

    const handleResetPassword = async () => {
        if (!selectedUser) return
        const { error } = await supabase.auth.resetPasswordForEmail(selectedUser.email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) toast.error(friendlyError(error, 'Failed to send reset email'))
        else toast.success('Password reset email sent')
    }

    const exportCSV = () => {
        const escField = (val) => {
            const s = String(val ?? '')
            const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
            return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
        }
        const headers = ['Name', 'Email', 'Role', 'Status', 'Joined']
        const rows = users.map(u => [
            u.full_name || '',
            u.email,
            ROLE_LABELS[u.role] || u.role,
            STATUS_LABELS[u.application_status] || u.application_status || '',
            new Date(u.created_at).toLocaleDateString(),
        ])
        const csv = [headers, ...rows].map(r => r.map(escField).join(',')).join('\n')
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'users.csv'; a.click()
        URL.revokeObjectURL(url)
    }

    const getRoleColor = (role) => {
        const c = ROLE_COLORS[role] || 'slate'
        const map = {
            blue: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
            purple: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
            emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
            indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
            red: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
            slate: 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        }
        return map[c] || map.slate
    }

    const getStatusDot = (status) => {
        const map = { active: 'bg-emerald-500', pending_review: 'bg-amber-500', inactive: 'bg-slate-400', suspended: 'bg-red-500' }
        return map[status] || 'bg-slate-400'
    }

    const totalPages = Math.ceil(total / PAGE_SIZE)

    // Sliding window: show up to 5 page buttons centred around current page
    const pageButtons = (() => {
        const half = 2
        let start = Math.max(0, page - half)
        let end = Math.min(totalPages - 1, start + 4)
        start = Math.max(0, end - 4)
        const pages = []
        for (let i = start; i <= end; i++) pages.push(i)
        return pages
    })()

    return (
        <div className="flex flex-col gap-6 h-full relative">
            {/* Confirm modal for suspend/reactivate actions */}
            <ConfirmModal
                open={!!confirm}
                onClose={() => setConfirm(null)}
                onConfirm={executeSuspend}
                title={confirm?.label || ''}
                message={confirm?.message || ''}
                confirmLabel={confirm?.label || 'Confirm'}
                variant="danger"
                loading={saving}
            />

            {/* F-UM01: Confirm role change — elevation to admin is highlighted as critical */}
            <ConfirmModal
                open={!!roleConfirm}
                onClose={() => setRoleConfirm(null)}
                onConfirm={doSave}
                title={`Change role: ${ROLE_LABELS[roleConfirm?.from] || roleConfirm?.from} → ${ROLE_LABELS[roleConfirm?.to] || roleConfirm?.to}`}
                message={
                    roleConfirm?.to === 'admin'
                        ? `You are granting ${roleConfirm?.userName} full platform admin access. Admins can manage all users, settings, and data. This is irreversible without another admin changing it back.`
                        : `You are changing ${roleConfirm?.userName}'s role from ${ROLE_LABELS[roleConfirm?.from] || roleConfirm?.from} to ${ROLE_LABELS[roleConfirm?.to] || roleConfirm?.to}. Their dashboard and permissions will change immediately.`
                }
                confirmLabel={roleConfirm?.to === 'admin' ? 'Grant admin access' : 'Change role'}
                variant={roleConfirm?.to === 'admin' ? 'danger' : 'primary'}
                loading={saving}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3">
                {/* Note: only exports the current page — labelled accordingly to set expectations. */}
                <Button variant="outline" icon="file_download" onClick={exportCSV}>Export this page</Button>
            </div>

            {/* KPI Cards — all wired to real data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: loading ? '—' : total.toLocaleString(), trend: 'All registered users', trendColor: 'slate', icon: 'group', iconColor: 'blue' },
                    { label: 'Pending Verification', value: kpiLoading ? '—' : kpi.pending_verification, trend: 'Awaiting review', trendColor: kpi.pending_verification > 0 ? 'amber' : 'slate', icon: 'verified_user', iconColor: 'amber' },
                    { label: 'Consultants', value: kpiLoading ? '—' : kpi.consultants, trend: 'Active professionals', trendColor: 'slate', icon: 'school', iconColor: 'purple' },
                    { label: 'Agencies', value: kpiLoading ? '—' : kpi.agencies, trend: 'Registered agencies', trendColor: 'slate', icon: 'apartment', iconColor: 'emerald' },
                ].map((stat) => (
                    <Card key={stat.label} className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                            <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${stat.trendColor === 'amber' ? 'text-amber-600' : 'text-slate-500'}`}>
                                {stat.trendColor === 'amber' && <span className="material-symbols-outlined text-[16px]">warning</span>}
                                {stat.trend}
                            </p>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.iconColor === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-primary' : stat.iconColor === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : stat.iconColor === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'}`}>
                            <span className="material-symbols-outlined">{stat.icon}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                <div className="flex w-full lg:w-auto flex-1 gap-2 overflow-x-auto pb-2 lg:pb-0">
                    {Object.keys(ROLE_FILTER).map((filter) => (
                        <button key={filter} onClick={() => { setActiveFilter(filter); setPage(0) }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === filter ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'}`}>
                            {filter}
                        </button>
                    ))}
                </div>
                <div className="flex w-full lg:w-auto items-center gap-3">
                    <div className="relative w-full lg:w-72">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center material-symbols-outlined text-slate-400">search</span>
                        <input
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                            placeholder="Search by name or email"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(0) }}
                        />
                    </div>
                </div>
            </Card>

            {/* Data Table */}
            <Card className="flex-1 p-0 overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                {['User Info', 'Role', 'Status', 'Joined', 'Verified', ''].map((h) => (
                                    <th key={h} className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                            {loading ? (
                                [1,2,3,4,5].map(i => (
                                    <tr key={i}>
                                        <td colSpan={6} className="px-6 py-4">
                                            <div className="h-8 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                                        </td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">No users found</td>
                                </tr>
                            ) : users.map((user) => (
                                <tr key={user.id} onClick={() => handleUserClick(user)}
                                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${selectedUser?.id === user.id && drawerOpen ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-l-primary' : ''}`}>
                                    <td className={`px-6 py-4 whitespace-nowrap ${selectedUser?.id === user.id && drawerOpen ? 'pl-[21px]' : ''}`}>
                                        <div className="flex items-center">
                                            <Avatar size="sm" alt={user.full_name} src={user.avatar_url} />
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-slate-900 dark:text-white">{user.full_name || 'Unknown'}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getRoleColor(user.role)}`}>
                                            {ROLE_LABELS[user.role] || user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`h-2 w-2 rounded-full ${getStatusDot(user.application_status)}`} />
                                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{STATUS_LABELS[user.application_status] || 'Active'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.is_verified
                                            ? <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold"><span className="material-symbols-outlined text-sm">verified</span> Verified</span>
                                            : <span className="text-xs text-slate-400">Not verified</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-slate-400 hover:text-primary transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                                            <span className="material-symbols-outlined">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination with sliding window */}
                <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 px-6 py-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Showing <span className="font-bold text-slate-900 dark:text-white">{total === 0 ? 0 : page * PAGE_SIZE + 1}</span>
                        {' '}to{' '}
                        <span className="font-bold text-slate-900 dark:text-white">{Math.min((page + 1) * PAGE_SIZE, total)}</span>
                        {' '}of{' '}
                        <span className="font-bold text-slate-900 dark:text-white">{total.toLocaleString()}</span> results
                    </p>
                    <div className="flex gap-1">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                            className="px-2 py-2 rounded-l-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-500 disabled:opacity-40">
                            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                        </button>
                        {pageButtons.map(i => (
                            <button key={i} onClick={() => setPage(i)}
                                className={`px-4 py-2 border text-sm ${page === i ? 'border-primary bg-blue-50 dark:bg-blue-900/20 font-bold text-primary' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500'}`}>
                                {i + 1}
                            </button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                            className="px-2 py-2 rounded-r-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-500 disabled:opacity-40">
                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        </button>
                    </div>
                </div>
            </Card>

            {/* Slide-over Drawer */}
            {drawerOpen && selectedUser && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                    <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
                        <div className="w-screen max-w-[420px] transform transition-transform animate-slide-in-right">
                            <div className="flex h-full flex-col bg-white dark:bg-slate-900 shadow-2xl">
                                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit User</h3>
                                    <button onClick={() => setDrawerOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                        <span className="material-symbols-outlined text-[20px]">close</span>
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="flex flex-col items-center mb-6">
                                        <Avatar size="xl" alt={selectedUser.full_name} src={selectedUser.avatar_url} />
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-3">{selectedUser.full_name || 'Unknown'}</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
                                        <div className="flex gap-2 mt-3">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getRoleColor(selectedUser.role)}`}>{ROLE_LABELS[selectedUser.role] || selectedUser.role}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <label className="block">
                                            <span className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</span>
                                            <input className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm px-3 py-2.5"
                                                value={editForm.full_name || ''}
                                                onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} />
                                        </label>
                                        <label className="block">
                                            <span className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</span>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center material-symbols-outlined text-slate-400 text-[20px]">mail</span>
                                                <input className="w-full pl-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm px-3 py-2.5" value={editForm.email || ''} readOnly />
                                            </div>
                                            {/* F-UM07: explain why the field is read-only */}
                                            <p className="mt-1 text-xs text-slate-400">Email is managed by Supabase Auth. Use "Reset Password" to send the user a reset link.</p>
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <label className="block">
                                                <span className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Role</span>
                                                <select className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm px-3 py-2.5"
                                                    value={editForm.role || ''}
                                                    onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
                                                    <option value="client">Client</option>
                                                    <option value="individual">Consultant</option>
                                                    <option value="agency_admin">Agency</option>
                                                    <option value="agency_member">Team Member</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </label>
                                            <label className="block">
                                                <span className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Status</span>
                                                <select className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm px-3 py-2.5"
                                                    value={editForm.application_status || 'active'}
                                                    onChange={e => setEditForm(f => ({ ...f, application_status: e.target.value }))}>
                                                    <option value="active">Active</option>
                                                    <option value="pending_review">Pending Review</option>
                                                    <option value="inactive">Inactive</option>
                                                    <option value="suspended">Suspended</option>
                                                </select>
                                            </label>
                                        </div>
                                        <label className="flex items-center gap-3">
                                            <input type="checkbox" className="rounded"
                                                checked={editForm.is_verified || false}
                                                onChange={e => setEditForm(f => ({ ...f, is_verified: e.target.checked }))} />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Mark as Verified</span>
                                        </label>
                                        <div className="pt-2 text-xs text-slate-400">
                                            <p>User ID: <span className="font-mono">{selectedUser.id}</span></p>
                                            <p>Joined: {new Date(selectedUser.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                                    <Button className="w-full" onClick={handleSave} disabled={saving}>
                                        {saving ? 'Saving…' : 'Save Changes'}
                                    </Button>
                                    <div className="flex gap-3">
                                        <Button variant="outline" className="flex-1" onClick={handleResetPassword}>Reset Password</Button>
                                        <Button variant="danger" className="flex-1" disabled={saving}
                                            onClick={() => setConfirm({
                                                label: selectedUser.application_status === 'suspended' ? 'Reactivate User' : 'Suspend User',
                                                message: selectedUser.application_status === 'suspended'
                                                    ? `Reactivate ${selectedUser.full_name || selectedUser.email}? They will regain full platform access.`
                                                    : `Suspend ${selectedUser.full_name || selectedUser.email}? They will lose access to the platform immediately.`,
                                            })}>
                                            {selectedUser.application_status === 'suspended' ? 'Reactivate' : 'Suspend'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
            `}</style>
        </div>
    )
}
