import { useToastStore, type Toast, type ToastVariant } from '@/store/toastStore'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

const variantConfig: Record<ToastVariant, { icon: typeof CheckCircle; bg: string; iconClass: string; bar: string }> = {
  success: { icon: CheckCircle,    bg: 'bg-slate-900 border-emerald-500/30', iconClass: 'text-emerald-400', bar: 'bg-emerald-500' },
  error:   { icon: XCircle,        bg: 'bg-slate-900 border-red-500/30',     iconClass: 'text-red-400',     bar: 'bg-red-500' },
  warning: { icon: AlertTriangle,  bg: 'bg-slate-900 border-amber-500/30',   iconClass: 'text-amber-400',   bar: 'bg-amber-500' },
  info:    { icon: Info,           bg: 'bg-slate-900 border-blue-500/30',    iconClass: 'text-blue-400',    bar: 'bg-blue-500' },
}

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((s) => s.removeToast)
  const cfg = variantConfig[toast.variant]
  const Icon = cfg.icon

  return (
    <div
      className={[
        'toast-enter relative w-80 overflow-hidden rounded-xl border shadow-2xl shadow-black/40',
        cfg.bg,
      ].join(' ')}
      role="alert"
    >
      <div className={`absolute left-0 top-0 h-full w-0.5 ${cfg.bar}`} />
      <div className="flex items-start gap-3 p-4 pl-5">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.iconClass}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-100">{toast.title}</p>
          {toast.message && <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{toast.message}</p>}
        </div>
        <button
          onClick={() => removeToast(toast.id)}
          className="shrink-0 rounded-md p-0.5 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  )
}
