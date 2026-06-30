import clsx from 'clsx'

export function Card({ className, ...props }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200 bg-white shadow-soft',
        className,
      )}
      {...props}
    />
  )
}

