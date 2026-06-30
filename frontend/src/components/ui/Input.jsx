import clsx from 'clsx'

export function Input({ label, hint, error, className, ...props }) {
  return (
    <label className={clsx('block', className)}>
      {label ? <div className="mb-1 text-sm font-medium text-slate-700">{label}</div> : null}
      <input
        className={clsx(
          'h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none transition',
          error
            ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200'
            : 'border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-200',
        )}
        {...props}
      />
      {error ? (
        <div className="mt-1 text-xs text-rose-600">{error}</div>
      ) : hint ? (
        <div className="mt-1 text-xs text-slate-500">{hint}</div>
      ) : null}
    </label>
  )
}

