import { X } from 'lucide-react'
import clsx from 'clsx'

export function Modal({ open, title, children, onClose, footer }) {
  return (
    <div className={clsx('fixed inset-0 z-50', open ? '' : 'pointer-events-none')}>
      <div
        className={clsx(
          'absolute inset-0 bg-slate-900/40 transition-opacity',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      <div
        className={clsx(
          // Keep header fields visible: anchor modal slightly lower, not perfectly centered.
          'absolute left-1/2 top-24 flex max-h-[calc(100vh-7rem)] w-[92vw] max-w-lg -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition',
          open ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-slate-100 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  )
}

