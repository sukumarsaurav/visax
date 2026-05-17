import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase before importing the module under test
vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: vi.fn(),
        },
        from: vi.fn(),
    },
}))

import { writeAuditLog } from '../lib/auditLog'
import { supabase } from '../lib/supabase'

const mockInsert = vi.fn()

beforeEach(() => {
    vi.clearAllMocks()
    supabase.from.mockReturnValue({ insert: mockInsert })
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-uuid' } } })
    mockInsert.mockResolvedValue({ error: null })
})

describe('writeAuditLog', () => {
    it('inserts a row with the correct fields', async () => {
        await writeAuditLog({ action: 'User Approved', entityType: 'profile', entityId: 'user-1', details: { role: 'consultant' } })
        expect(supabase.from).toHaveBeenCalledWith('audit_logs')
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            user_id: 'admin-uuid',
            action: 'User Approved',
            entity_type: 'profile',
            entity_id: 'user-1',
            details: { role: 'consultant' },
        }))
    })

    it('uses null entity_id when not supplied', async () => {
        await writeAuditLog({ action: 'Settings Updated' })
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ entity_id: null }))
    })

    it('does NOT throw when supabase.auth.getUser rejects', async () => {
        supabase.auth.getUser.mockRejectedValue(new Error('auth error'))
        await expect(writeAuditLog({ action: 'User Approved' })).resolves.toBeUndefined()
    })

    it('does NOT throw when the insert itself fails', async () => {
        mockInsert.mockRejectedValue(new Error('DB error'))
        await expect(writeAuditLog({ action: 'Settings Updated' })).resolves.toBeUndefined()
    })

    it('does NOT throw when insert returns a Supabase error object', async () => {
        mockInsert.mockResolvedValue({ error: { message: 'RLS violation' } })
        await expect(writeAuditLog({ action: 'User Rejected' })).resolves.toBeUndefined()
    })
})
