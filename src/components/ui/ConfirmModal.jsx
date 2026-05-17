import Modal from './Modal'
import Button from './Button'

/**
 * Generic "are you sure?" dialog.
 * Props:
 *   open, onClose, onConfirm, title, message,
 *   confirmLabel (default "Confirm"), variant ("danger" | "primary")
 */
export default function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title = 'Confirm action',
    message,
    confirmLabel = 'Confirm',
    variant = 'danger',
    loading = false,
}) {
    return (
        <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button variant={variant} onClick={onConfirm} disabled={loading}>
                    {loading ? 'Please wait…' : confirmLabel}
                </Button>
            </div>
        </Modal>
    )
}
