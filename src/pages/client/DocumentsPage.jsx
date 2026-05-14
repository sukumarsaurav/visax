import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import { formatDate } from '../../utils/date'

function formatSize(bytes) {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const fileIcon = (mime) => {
    if (!mime) return 'description'
    if (mime.startsWith('image/')) return 'image'
    if (mime === 'application/pdf') return 'picture_as_pdf'
    if (mime.includes('word')) return 'article'
    return 'description'
}

export default function DocumentsPage() {
    const { user } = useAuth()
    const [docs, setDocs] = useState([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const fileRef = useRef()

    useEffect(() => {
        if (!user) return
        fetchDocs()
    }, [user])

    async function fetchDocs() {
        setLoading(true)
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .or(`uploaded_by.eq.${user.id},client_id.eq.${user.id}`)
            .order('created_at', { ascending: false })

        if (!error) setDocs(data || [])
        setLoading(false)
    }

    async function handleUpload(e) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const path = `${user.id}/${Date.now()}-${file.name}`

        const { error: uploadErr } = await supabase.storage.from('documents').upload(path, file)
        if (uploadErr) { toast.error('Upload failed: ' + uploadErr.message); setUploading(false); return }

        const { error: dbErr } = await supabase.from('documents').insert({
            name: file.name,
            file_path: path,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: user.id,
            client_id: user.id,
        })

        if (dbErr) {
            // Roll back the storage upload to avoid orphaned files
            await supabase.storage.from('documents').remove([path])
            toast.error('Failed to save document record')
        } else { toast.success('Document uploaded!'); fetchDocs() }
        setUploading(false)
        fileRef.current.value = ''
    }

    async function handleDelete(doc) {
        const { error: storageErr } = await supabase.storage.from('documents').remove([doc.file_path])
        if (storageErr) { toast.error('Failed to delete file'); return }
        const { error: dbErr } = await supabase.from('documents').delete().eq('id', doc.id)
        if (dbErr) { toast.error('Failed to remove document record'); return }
        setDocs(prev => prev.filter(d => d.id !== doc.id))
        toast.success('Document deleted')
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Documents</h2>
                    <p className="text-sm text-slate-500">{docs.length} file{docs.length !== 1 ? 's' : ''} stored securely</p>
                </div>
                <div>
                    <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary/90 disabled:opacity-60"
                    >
                        <span className="material-symbols-outlined text-[18px]">{uploading ? 'hourglass_empty' : 'upload_file'}</span>
                        {uploading ? 'Uploading…' : 'Upload File'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                    ))}
                </div>
            ) : docs.length === 0 ? (
                <Card>
                    <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                        <span className="material-symbols-outlined text-[48px]">folder_open</span>
                        <p className="font-semibold">No documents yet</p>
                        <p className="text-sm">Upload files to share with your consultant or keep as records</p>
                    </div>
                </Card>
            ) : (
                <Card>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {docs.map(doc => (
                            <div key={doc.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined text-[20px]">{fileIcon(doc.mime_type)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{doc.name}</p>
                                    <p className="text-xs text-slate-500">{formatSize(doc.file_size)} · {formatDate(doc.created_at)}</p>
                                </div>
                                {doc.is_shared && <Badge variant="blue">Shared</Badge>}
                                <button
                                    onClick={() => handleDelete(doc)}
                                    className="ml-2 flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                    title="Delete"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    )
}
