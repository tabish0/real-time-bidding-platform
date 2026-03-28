import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export function Textarea({ label, error, hint, className = '', id, ...props }: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-slate-300">
          {label}
          {props.required && <span className="ml-1 text-violet-400">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={[
          'w-full rounded-lg border bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100',
          'placeholder:text-slate-500 resize-y transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50',
          error
            ? 'border-red-500/50 focus:ring-red-500/40'
            : 'border-slate-700/80 hover:border-slate-600',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
