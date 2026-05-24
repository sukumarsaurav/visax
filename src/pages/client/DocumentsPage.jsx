import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ConfirmModal from '../../components/ui/ConfirmModal'
import toast from 'react-hot-toast'
import { formatDate } from '../../utils/date'
import * as documentsRepo from '../../data/documentsRepo'
import { uploadDocument, removeDocumentFile, getSignedUrl } from '../../lib/storage'

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
    const [downloadingId, setDownloadingId] = useState(null)
    // F-DC02: confirmation before permanent delete
    const [deleteConfirm, setDeleteConfirm] = useState(null) // doc object
    const [deleting, setDeleting] = useState(false)
    const fileRef = useRef()

    useEffect(() => {
        if (!user) return
        fetchDocs()
    }, [user])

    async function fetchDocs() {
        setLoading(true)
        const { data, error } = await documentsRepo.listForClient(user.id)
        if (!error) setDocs(data || [])
        setLoading(false)
    }

    async function handleUpload(e) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        // uploadDocument validates (magic bytes + size + sanitised name)
        // and returns { path, mime, name, size } — trustworthy metadata
        // from the content, not the (spoofable) browser-claimed type.
        let meta
        try {
            meta = await uploadDocument(file, user.id)
        } catch (err) {
            toast.error('Upload failed: ' + (err.message || 'Unknown error'))
            setUploading(false)
            if (fileRef.current) fileRef.current.value = ''
            return
        }

        const { error: dbErr } = await documentsRepo.create({
            name: meta.name,
            file_path: meta.path,
            file_size: meta.size,
            mime_type: meta.mime,
            uploaded_by: user.id,
            client_id: user.id,
        })

        if (dbErr) {
            // Roll back the storage upload so we don't leak orphan files.
            await removeDocumentFile(meta.path).catch(() => {})
            toast.error('Failed to save document record. Please try again.')
        } else {
            toast.success('Document uploaded!')
            fetchDocs()
        }
        setUploading(false)
        if (fileRef.current) fileRef.current.value = ''
    }

    async function handleDownload(doc) {
        if (!doc.file_path) return
        setDownloadingId(doc.id)
        try {
            const url = await getSignedUrl(doc.file_path, 300) // 5-minute link
            const a = document.createElement('a')
            a.href = url
            a.download = doc.name || 'document'
            a.click()
        } catch {
            toast.error('Could not generate download link. Please try again.')
        }
        setDownloadingId(null)
    }

    async function doDelete(doc) {
        setDeleting(true)
        try {
            await removeDocumentFile(doc.file_path)
        } catch {
            toast.error('Failed to delete file')
            setDeleting(false)
            setDeleteConfirm(null)
            return
        }
        const { error: dbErr } = await documentsRepo.remove(doc.id)
        if (dbErr) { toast.error('Failed to remove document record') }
        else {
            setDocs(prev => prev.filter(d => d.id !== doc.id))
            toast.success('Document deleted')
        }
        setDeleting(false)
        setDeleteConfirm(null)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* F-DC02: confirm before permanently deleting a document */}
            <ConfirmModal
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => doDelete(deleteConfirm)}
                title="Delete document?"
                message={`"${deleteConfirm?.name}" will be permanently removed and cannot be recovered.`}
                confirmLabel="Delete"
                variant="danger"
                loading={deleting}
            />

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
                                {doc.file_path && (
                                    <button
                                        onClick={() => handleDownload(doc)}
                                        disabled={downloadingId === doc.id}
                                        className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50"
                                        title="Download"
                                    >
                                        <span className={`material-symbols-outlined text-[18px] ${downloadingId === doc.id ? 'animate-pulse' : ''}`}>
                                            {downloadingId === doc.id ? 'hourglass_empty' : 'download'}
                                        </span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setDeleteConfirm(doc)}
                                    className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
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
