import { supabase } from './supabase'

const MAX_AVATAR_MB = 5
const MAX_DOC_MB = 20

export function validateImageFile(file) {
    if (!file.type.startsWith('image/')) return 'Only image files are allowed (JPG, PNG, WebP)'
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) return `Image must be under ${MAX_AVATAR_MB}MB`
    return null
}

export function validateDocFile(file) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(file.type)) return 'Only JPG, PNG, WebP, or PDF files are allowed'
    if (file.size > MAX_DOC_MB * 1024 * 1024) return `File must be under ${MAX_DOC_MB}MB`
    return null
}

// Upload a profile avatar — path: {userId}/avatar.{ext}
export async function uploadAvatar(file, userId) {
    const ext = file.name.split('.').pop().toLowerCase()
    const path = `${userId}/avatar.${ext}`

    const { error } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    // Bust cache with timestamp
    return `${data.publicUrl}?t=${Date.now()}`
}

// Upload an unclaimed profile avatar — path: unclaimed/{unclaimedId}/avatar.{ext}
export async function uploadUnclaimedAvatar(file, profileId) {
    const ext = file.name.split('.').pop().toLowerCase()
    const path = `unclaimed/${profileId}/avatar.${ext}`

    const { error } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return `${data.publicUrl}?t=${Date.now()}`
}

// Upload a credential/certification document — path: {userId}/{timestamp}-{filename}
// Returns { path, publicUrl? } — documents bucket is private so no publicUrl
export async function uploadDocument(file, userId) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${userId}/${Date.now()}-${safeName}`

    const { error } = await supabase.storage
        .from('documents')
        .upload(path, file, { contentType: file.type })

    if (error) throw new Error(error.message)
    return path
}

// Get a signed URL for a private document (valid 60 minutes)
export async function getDocumentUrl(path) {
    const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(path, 3600)
    if (error) throw new Error(error.message)
    return data.signedUrl
}

// Delete a file from storage
export async function deleteStorageFile(bucket, path) {
    const { error } = await supabase.storage.from(bucket).remove([path])
    if (error) throw new Error(error.message)
}
