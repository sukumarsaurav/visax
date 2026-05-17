import { supabase } from './supabase'

export async function uploadAvatar(file, userId) {
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId)
    return data.publicUrl
}

export async function uploadDocument(file, userId) {
    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('documents').upload(path, file, { upsert: false })
    if (error) throw error
    const { data } = supabase.storage.from('documents').getPublicUrl(path)
    return data.publicUrl
}

const ALLOWED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const ALLOWED_IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_DOC_SIZE_MB = 25
const MAX_IMG_SIZE_MB = 5

export function validateDocFile(file) {
    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
        return 'Only PDF, JPEG, PNG or WebP files are allowed.'
    }
    if (file.size > MAX_DOC_SIZE_MB * 1024 * 1024) {
        return `File must be under ${MAX_DOC_SIZE_MB}MB.`
    }
    return null
}

export function validateImageFile(file) {
    if (!ALLOWED_IMG_TYPES.includes(file.type)) {
        return 'Only JPEG, PNG, WebP or GIF images are allowed.'
    }
    if (file.size > MAX_IMG_SIZE_MB * 1024 * 1024) {
        return `Image must be under ${MAX_IMG_SIZE_MB}MB.`
    }
    return null
}
