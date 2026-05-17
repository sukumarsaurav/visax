import { useRef, useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { validateImageFile } from '../../lib/storage'
import toast from 'react-hot-toast'

// Convert crop area pixels to a cropped Blob
async function getCroppedBlob(imageSrc, pixelCrop, fileName) {
    const image = await createImageBitmap(await (await fetch(imageSrc)).blob())
    const canvas = document.createElement('canvas')
    const size = Math.min(pixelCrop.width, pixelCrop.height, 800)
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y,
        pixelCrop.width, pixelCrop.height,
        0, 0, size, size,
    )
    return new Promise(resolve => {
        canvas.toBlob(blob => {
            resolve(new File([blob], fileName, { type: 'image/jpeg' }))
        }, 'image/jpeg', 0.92)
    })
}

/**
 * AvatarUpload — picks an image, opens a crop/adjust modal, then calls onUpload(croppedFile).
 *
 * Props:
 *   currentUrl  — existing avatar URL
 *   name        — user's name for initials fallback
 *   onUpload    — async (file: File) => string  — returns public URL
 *   size        — 'sm' | 'md' | 'lg'
 *   disabled    — boolean
 */
export default function AvatarUpload({ currentUrl, name, onUpload, size = 'md', disabled = false }) {
    const [preview, setPreview] = useState(currentUrl || null)
    const [uploading, setUploading] = useState(false)

    // Crop modal state
    const [cropSrc, setCropSrc] = useState(null)
    const [cropFileName, setCropFileName] = useState('avatar.jpg')
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

    const inputRef = useRef()

    const sizes = {
        sm: { wrap: 'size-16', text: 'text-lg', icon: 'text-[14px]', badge: 'size-6 -bottom-0.5 -right-0.5' },
        md: { wrap: 'size-24', text: 'text-2xl', icon: 'text-[16px]', badge: 'size-7 -bottom-0.5 -right-0.5' },
        lg: { wrap: 'size-32', text: 'text-3xl', icon: 'text-[18px]', badge: 'size-8 -bottom-1 -right-1' },
    }
    const sz = sizes[size]

    const initials = name
        ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : '?'

    function openPicker() { inputRef.current?.click() }

    function handleFileChange(e) {
        const file = e.target.files?.[0]
        if (!file) return
        const err = validateImageFile(file)
        if (err) { toast.error(err); return }

        const url = URL.createObjectURL(file)
        setCropSrc(url)
        setCropFileName(file.name)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        if (inputRef.current) inputRef.current.value = ''
    }

    const onCropComplete = useCallback((_, pixels) => {
        setCroppedAreaPixels(pixels)
    }, [])

    function nudge(axis, dir) {
        setCrop(c => ({
            ...c,
            [axis]: c[axis] + dir * 5,
        }))
    }

    function cancelCrop() {
        setCropSrc(null)
        URL.revokeObjectURL(cropSrc)
    }

    async function confirmCrop() {
        if (!croppedAreaPixels) return
        setUploading(true)
        setCropSrc(null)

        try {
            const croppedFile = await getCroppedBlob(cropSrc, croppedAreaPixels, cropFileName)
            URL.revokeObjectURL(cropSrc)

            // Instant local preview
            const localUrl = URL.createObjectURL(croppedFile)
            setPreview(localUrl)

            const remoteUrl = await onUpload(croppedFile)
            setPreview(remoteUrl)
            URL.revokeObjectURL(localUrl)
        } catch (err) {
            toast.error('Upload failed: ' + err.message)
            setPreview(currentUrl || null)
        } finally {
            setUploading(false)
        }
    }

    return (
        <>
            {/* Avatar trigger */}
            <div className="relative inline-block shrink-0">
                <div className={`${sz.wrap} rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-600 bg-gradient-to-br from-indigo-400 to-purple-500`}>
                    {preview ? (
                        <img src={preview} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center text-white font-black ${sz.text}`}>
                            {initials}
                        </div>
                    )}
                    {!disabled && (
                        <button
                            type="button"
                            onClick={openPicker}
                            className="absolute inset-0 rounded-full bg-black/40 opacity-0 hover:opacity-100 flex flex-col items-center justify-center gap-0.5 transition-opacity cursor-pointer"
                        >
                            {uploading
                                ? <span className={`material-symbols-outlined text-white ${sz.icon} animate-spin`}>progress_activity</span>
                                : <>
                                    <span className={`material-symbols-outlined text-white ${sz.icon}`}>photo_camera</span>
                                    <span className="text-white text-[9px] font-bold uppercase tracking-wide">Change</span>
                                </>
                            }
                        </button>
                    )}
                </div>

                {!disabled && (
                    <button
                        type="button"
                        onClick={openPicker}
                        disabled={uploading}
                        className={`absolute ${sz.badge} rounded-full bg-primary border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors disabled:opacity-60`}
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
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled || uploading}
                />
            </div>

            {/* Crop Modal */}
            {cropSrc && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Adjust Profile Photo</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Drag to reposition · Scroll or slide to zoom</p>
                            </div>
                            <button onClick={cancelCrop}
                                className="flex size-8 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        {/* Crop area */}
                        <div className="relative w-full bg-slate-950" style={{ height: 320 }}>
                            <Cropper
                                image={cropSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                style={{
                                    containerStyle: { borderRadius: 0 },
                                    cropAreaStyle: {
                                        border: '3px solid #4F46E5',
                                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
                                    },
                                }}
                            />
                        </div>

                        {/* Controls */}
                        <div className="px-5 py-4 space-y-4 bg-slate-50 dark:bg-slate-800/50">

                            {/* Zoom slider */}
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => setZoom(z => Math.max(1, +(z - 0.1).toFixed(1)))}
                                    className="flex size-7 items-center justify-center rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary transition-colors">
                                    <span className="material-symbols-outlined text-[16px]">zoom_out</span>
                                </button>
                                <input
                                    type="range"
                                    min={1} max={3} step={0.01}
                                    value={zoom}
                                    onChange={e => setZoom(Number(e.target.value))}
                                    className="flex-1 h-1.5 rounded-full accent-primary cursor-pointer"
                                />
                                <button type="button" onClick={() => setZoom(z => Math.min(3, +(z + 0.1).toFixed(1)))}
                                    className="flex size-7 items-center justify-center rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary transition-colors">
                                    <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                                </button>
                                <span className="text-xs text-slate-400 w-10 text-right">{zoom.toFixed(1)}×</span>
                            </div>

                            {/* Nudge pad */}
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mr-2">Move:</p>
                                <div className="grid grid-cols-3 gap-1">
                                    <div />
                                    <button type="button" onClick={() => nudge('y', -5)}
                                        className="flex size-8 items-center justify-center rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                                    </button>
                                    <div />
                                    <button type="button" onClick={() => nudge('x', -5)}
                                        className="flex size-8 items-center justify-center rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                    </button>
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-600">
                                        <span className="material-symbols-outlined text-[14px] text-slate-400">open_with</span>
                                    </div>
                                    <button type="button" onClick={() => nudge('x', 5)}
                                        className="flex size-8 items-center justify-center rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                    </button>
                                    <div />
                                    <button type="button" onClick={() => nudge('y', 5)}
                                        className="flex size-8 items-center justify-center rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                                    </button>
                                    <div />
                                </div>
                                <button type="button"
                                    onClick={() => { setCrop({ x: 0, y: 0 }); setZoom(1) }}
                                    className="ml-2 text-xs text-slate-400 hover:text-primary transition-colors flex flex-col items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                                    <span>Reset</span>
                                </button>
                            </div>
                        </div>

                        {/* Footer actions */}
                        <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-200 dark:border-slate-700">
                            <button type="button" onClick={cancelCrop}
                                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                Cancel
                            </button>
                            <button type="button" onClick={confirmCrop}
                                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-sm font-bold text-white transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">check</span>
                                Apply & Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
