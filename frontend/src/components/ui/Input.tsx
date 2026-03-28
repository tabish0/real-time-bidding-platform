import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftAddon?: ReactNode
  rightAddon?: ReactNode
}

export function Input({ label, error, hint, leftAddon, rightAddon, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
          {label}
          {props.required && <span className="ml-1 text-violet-400">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftAddon && (
          <span className="pointer-events-none absolute left-3 text-slate-400">{leftAddon}</span>
        )}
        <input
          id={inputId}
          className={[
            'w-full rounded-lg border bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100',
            'placeholder:text-slate-500 transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50',
            error
              ? 'border-red-500/50 focus:ring-red-500/40 focus:border-red-500/50'
              : 'border-slate-700/80 hover:border-slate-600',
            leftAddon ? 'pl-10' : '',
            rightAddon ? 'pr-10' : '',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className,
          ].join(' ')}
          {...props}
        />
        {rightAddon && (
          <span className="pointer-events-none absolute right-3 text-slate-400">{rightAddon}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
