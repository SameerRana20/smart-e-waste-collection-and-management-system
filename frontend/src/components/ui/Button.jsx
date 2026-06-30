import clsx from 'clsx'

export function Button({
  as: Comp = 'button',
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60'
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
    outline: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
  }
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  }
  return (
    <Comp
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
}

