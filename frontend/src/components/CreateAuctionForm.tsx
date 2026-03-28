import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Tag, FileText, DollarSign, Clock, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useCreateAuction } from '@/hooks/useAuctions'
import { useNavigate } from 'react-router-dom'
import type { CreateAuctionPayload } from '@/types'

interface FormState {
  name: string
  description: string
  startingPrice: string
  durationHours: string
}

interface FormErrors {
  name?: string
  description?: string
  startingPrice?: string
  durationHours?: string
}

const INITIAL: FormState = { name: '', description: '', startingPrice: '', durationHours: '' }

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}

  if (!form.name.trim()) errors.name = 'Item name is required.'
  else if (form.name.length > 255) errors.name = 'Name must be 255 characters or fewer.'

  if (!form.description.trim()) errors.description = 'Description is required.'

  const price = parseFloat(form.startingPrice)
  if (!form.startingPrice) errors.startingPrice = 'Starting price is required.'
  else if (isNaN(price) || price <= 0) errors.startingPrice = 'Price must be a positive number.'
  else if (!/^\d+(\.\d{0,2})?$/.test(form.startingPrice)) errors.startingPrice = 'Maximum 2 decimal places.'

  const hours = parseInt(form.durationHours, 10)
  if (!form.durationHours) errors.durationHours = 'Duration is required.'
  else if (isNaN(hours) || hours < 1 || hours > 8760)
    errors.durationHours = 'Duration must be between 1 and 8760 hours.'

  return errors
}

const DURATION_PRESETS = [
  { label: '1h',    value: '1' },
  { label: '6h',    value: '6' },
  { label: '12h',   value: '12' },
  { label: '24h',   value: '24' },
  { label: '3 days', value: '72' },
  { label: '7 days', value: '168' },
]

export function CreateAuctionForm() {
  const navigate = useNavigate()
  const { mutate: createAuction, isPending } = useCreateAuction()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  function handleChange(field: keyof FormState) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      if (submitted) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const errs = validate(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const payload: CreateAuctionPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
      startingPrice: parseFloat(form.startingPrice),
      durationHours: parseInt(form.durationHours, 10),
    }

    createAuction(payload, {
      onSuccess: (auction) => navigate(`/auctions/${auction.id}`),
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Item details */}
      <section className="glass-card rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/20">
            <Tag className="h-4 w-4 text-violet-400" />
          </div>
          <h2 className="font-semibold text-slate-200">Item Details</h2>
        </div>

        <Input
          label="Item name"
          placeholder="e.g. Vintage Rolex Submariner 1964"
          value={form.name}
          onChange={handleChange('name')}
          error={errors.name}
          maxLength={255}
          required
        />

        <Textarea
          label="Description"
          placeholder="Describe the item in detail — condition, provenance, specifications…"
          value={form.description}
          onChange={handleChange('description')}
          error={errors.description}
          rows={4}
          required
        />
      </section>

      {/* Pricing */}
      <section className="glass-card rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/20">
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <h2 className="font-semibold text-slate-200">Pricing</h2>
        </div>

        <Input
          label="Starting price"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={form.startingPrice}
          onChange={handleChange('startingPrice')}
          error={errors.startingPrice}
          leftAddon={<DollarSign className="h-4 w-4" />}
          hint="The minimum opening bid. Bidders must exceed this price."
          required
        />
      </section>

      {/* Duration */}
      <section className="glass-card rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20">
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <h2 className="font-semibold text-slate-200">Auction Duration</h2>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-300 mb-2">Quick select</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {DURATION_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => { setForm((f) => ({ ...f, durationHours: p.value })); if (submitted) setErrors((e) => ({ ...e, durationHours: undefined })) }}
                className={[
                  'rounded-lg border px-3 py-1.5 text-sm font-medium transition-all',
                  form.durationHours === p.value
                    ? 'border-violet-500/50 bg-violet-600/20 text-violet-300'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-slate-200',
                ].join(' ')}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Custom duration (hours)"
          type="number"
          min="1"
          max="8760"
          step="1"
          placeholder="e.g. 48"
          value={form.durationHours}
          onChange={handleChange('durationHours')}
          error={errors.durationHours}
          leftAddon={<Clock className="h-4 w-4" />}
          hint="Between 1 hour and 1 year (8,760 hours)."
          required
        />
      </section>

      {/* Preview */}
      {form.name && form.startingPrice && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">Preview</span>
          </div>
          <p className="text-sm text-slate-300">
            <strong className="text-white">{form.name}</strong> starting at{' '}
            <strong className="text-emerald-400">
              ${parseFloat(form.startingPrice || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>
            {form.durationHours && (
              <> — runs for <strong className="text-white">{form.durationHours}h</strong></>
            )}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate(-1)}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isPending}
          leftIcon={<FileText className="h-4 w-4" />}
          className="flex-1"
        >
          {isPending ? 'Creating…' : 'Create Auction'}
        </Button>
      </div>
    </form>
  )
}
