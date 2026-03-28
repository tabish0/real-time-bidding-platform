import { useState, type FormEvent } from 'react'
import { DollarSign, Gavel, AlertCircle, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { usePlaceBid } from '@/hooks/useBids'
import { useUserStore } from '@/store/userStore'
import type { Auction } from '@/types'
import { useNavigate } from 'react-router-dom'

interface BidFormProps {
  auction: Auction
}

export function BidForm({ auction }: BidFormProps) {
  const navigate = useNavigate()
  const { currentUser } = useUserStore()
  const { mutate: placeBid, isPending } = usePlaceBid(auction.id)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  const minBid = (auction.currentHighestBid ?? auction.startingPrice) + 0.01
  const isEnded = auction.status !== 'active'

  function validate(val: string): string {
    if (!val.trim()) return 'Please enter a bid amount.'
    const num = parseFloat(val)
    if (isNaN(num) || num <= 0) return 'Bid must be a positive number.'
    if (!/^\d+(\.\d{0,2})?$/.test(val)) return 'Maximum 2 decimal places allowed.'
    if (num <= (auction.currentHighestBid ?? auction.startingPrice)) {
      return `Bid must exceed the current ${auction.currentHighestBid ? 'highest bid' : 'starting price'} of $${(auction.currentHighestBid ?? auction.startingPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}.`
    }
    return ''
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const err = validate(amount)
    if (err) { setError(err); return }
    setError('')
    placeBid(
      { userId: currentUser!.id, amount: parseFloat(amount) },
      { onSuccess: () => setAmount('') },
    )
  }

  function handleQuickBid(increment: number) {
    const next = ((auction.currentHighestBid ?? auction.startingPrice) + increment).toFixed(2)
    setAmount(next)
    setError('')
  }

  // Not logged in
  if (!currentUser) {
    return (
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-5 text-center space-y-3">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600/20">
            <User className="h-6 w-6 text-violet-400" />
          </div>
        </div>
        <p className="text-sm text-slate-400">Select a user to place a bid</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/')}
          className="w-full"
        >
          Go to dashboard to select user
        </Button>
      </div>
    )
  }

  // Ended
  if (isEnded) {
    return (
      <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-5 text-center">
        <p className="text-sm text-slate-500">
          This auction has ended and is no longer accepting bids.
        </p>
      </div>
    )
  }

  const quickIncrements = [1, 5, 10, 50].filter((i) => minBid + i - 0.01 <= minBid * 5)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Current bid reminder */}
      <div className="rounded-lg bg-slate-800/50 border border-slate-700/40 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Minimum bid</span>
          <span className="font-semibold text-slate-200 tabular-nums">
            ${minBid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-slate-400">Bidding as</span>
          <span className="font-medium text-violet-300">{currentUser.name}</span>
        </div>
      </div>

      {/* Quick bid buttons */}
      {quickIncrements.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">Quick bid (+)</p>
          <div className="flex gap-2 flex-wrap">
            {quickIncrements.map((inc) => (
              <button
                key={inc}
                type="button"
                onClick={() => handleQuickBid(inc)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-violet-500/40 hover:text-violet-300 transition-all"
              >
                +${inc}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bid input */}
      <Input
        label="Your bid amount"
        type="number"
        step="0.01"
        min={minBid}
        value={amount}
        onChange={(e) => { setAmount(e.target.value); setError('') }}
        placeholder={`e.g. ${minBid.toFixed(2)}`}
        error={error}
        leftAddon={<DollarSign className="h-4 w-4" />}
        required
      />

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-400 leading-relaxed">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isPending}
        leftIcon={<Gavel className="h-5 w-5" />}
        className="w-full"
      >
        {isPending ? 'Placing bid…' : 'Place Bid'}
      </Button>

      <p className="text-center text-xs text-slate-600">
        By placing a bid you agree to complete the purchase if you win.
      </p>
    </form>
  )
}
