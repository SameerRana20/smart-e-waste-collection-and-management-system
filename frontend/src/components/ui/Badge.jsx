import clsx from 'clsx'

export function Badge({ tone = 'slate', className, ...props }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-brand-100 text-brand-800',
    yellow: 'bg-amber-100 text-amber-800',
    red: 'bg-rose-100 text-rose-800',
    blue: 'bg-sky-100 text-sky-800',
  }
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        tones[tone] || tones.slate,
        className,
      )}
      {...props}
    />
  )
}

