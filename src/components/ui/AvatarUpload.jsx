import { useRef, useState } from 'react'
import { validateImageFile } from '../../lib/storage'
import toast from 'react-hot-toast'

/**
 * Reusable avatar upload widget.
 *
 * Props:
 *   currentUrl  — existing avatar URL to display
 *   name        — user's name (for initials fallback)
 *   onUpload    — async (file: File) => string  — caller handles actual upload, returns new URL
 *   size        — 'sm' | 'md' | 'lg'  (default 'md')
 *   disabled    — boolean
 */
export default function AvatarUpload({ currentUrl, name, onUpload, size = 'md', disabled = false }) {
    const [preview, setPreview] = useState(currentUrl || null)
    const [uploading, setUploading] = useState(false)
    const inputRef = useRef()

    const sizes = {
        sm: { wrap: 'size-16', text: 'text-lg', icon: 'text-[14px]' },
        md: { wrap: 'size-24', text: 'text-2xl', icon: 'text-[16px]' },
        lg: { wrap: 'size-32', text: 'text-3xl', icon: 'text-[18px]' },
    }
    const sz = sizes[size]

    const initials = name
        ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : '?'

    async function handleChange(e) {
        const file = e.target.files?.[0]
        if (!file) return

        const err = validateImageFile(file)
        if (err) { toast.error(err); return }

        // Show local preview immediately
        const localUrl = URL.createObjectURL(file)
        setPreview(localUrl)

        setUploading(true)
        try {
            const remoteUrl = await onUpload(file)
            setPreview(remoteUrl)
            URL.revokeObjectURL(localUrl)
        } catch (err) {
            toast.error('Upload failed: ' + err.message)
            setPreview(currentUrl || null)
        } finally {
            setUploading(false)
            if (inputRef.current) inputRef.current.value = ''
        }
    }

    return (
        <div className="relative inline-block">
            {/* Avatar circle */}
            <div className={`${sz.wrap} rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-600 bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0`}>
                {preview ? (
                    <img src={preview} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center text-white font-black ${sz.text}`}>
                        {initials}
                    </div>
                )}

                {/* Upload overlay on hover */}
                {!disabled && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="absolute inset-0 rounded-full bg-black/40 opacity-0 hover:opacity-100 flex flex-col items-center justify-center gap-0.5 transition-opacity cursor-pointer"
                    >
                        {uploading ? (
                            <span className={`material-symbols-outlined text-white ${sz.icon} animate-spin`}>progress_activity</span>
                        ) : (
                            <>
                                <span className={`material-symbols-outlined text-white ${sz.icon}`}>photo_camera</span>
                                <span className="text-white text-[9px] font-bold uppercase tracking-wide">Change</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Camera badge */}
            {!disabled && (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="absolute -bottom-0.5 -right-0.5 size-7 rounded-full bg-primary border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors disabled:opacity-60"
                >
                    {uploading
                        ? <span className="material-symbols-outlined text-white text-[13px] animate-spin">progress_activity</span>
                        : <span className="material-symbols-outlined text-white text-[13px]">photo_camera</span>
                    }
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleChange}
                className="hidden"
                disabled={disabled || uploading}
            />
        </div>
    )
}
