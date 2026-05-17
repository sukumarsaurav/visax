import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmModal from '../components/ui/ConfirmModal'

// Modal renders children via a portal — mock it to render inline so jsdom can see it
vi.mock('../components/ui/Modal', () => ({
    default: ({ open, children, title }) =>
        open ? (
            <div role="dialog" aria-modal="true">
                <h2>{title}</h2>
                {children}
            </div>
        ) : null,
}))

// Button is a thin wrapper — render as its children so we can fire events
vi.mock('../components/ui/Button', () => ({
    default: ({ children, onClick, disabled }) => (
        <button onClick={onClick} disabled={disabled}>{children}</button>
    ),
}))

describe('ConfirmModal', () => {
    it('is not visible when open=false', () => {
        render(<ConfirmModal open={false} onClose={vi.fn()} onConfirm={vi.fn()} message="Delete?" />)
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders title and message when open=true', () => {
        render(<ConfirmModal open title="Are you sure?" message="This action cannot be undone." onClose={vi.fn()} onConfirm={vi.fn()} />)
        expect(screen.getByText('Are you sure?')).toBeInTheDocument()
        expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
    })

    it('calls onClose when Cancel is clicked', () => {
        const onClose = vi.fn()
        render(<ConfirmModal open message="Delete?" onClose={onClose} onConfirm={vi.fn()} />)
        fireEvent.click(screen.getByText('Cancel'))
        expect(onClose).toHaveBeenCalledOnce()
    })

    it('calls onConfirm when the confirm button is clicked', () => {
        const onConfirm = vi.fn()
        render(<ConfirmModal open message="Suspend user?" onClose={vi.fn()} onConfirm={onConfirm} confirmLabel="Suspend" />)
        fireEvent.click(screen.getByText('Suspend'))
        expect(onConfirm).toHaveBeenCalledOnce()
    })

    it('disables both buttons and shows loading text when loading=true', () => {
        render(<ConfirmModal open loading message="Working…" onClose={vi.fn()} onConfirm={vi.fn()} confirmLabel="Delete" />)
        const buttons = screen.getAllByRole('button')
        buttons.forEach(btn => expect(btn).toBeDisabled())
        expect(screen.getByText('Please wait…')).toBeInTheDocument()
    })
})
