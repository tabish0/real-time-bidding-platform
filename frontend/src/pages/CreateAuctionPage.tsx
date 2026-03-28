import { ArrowLeft, Gavel } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CreateAuctionForm } from '@/components/CreateAuctionForm'
import { Button } from '@/components/ui/Button'

export function CreateAuctionPage() {
  const navigate = useNavigate()
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20">
          <Gavel className="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Create Auction</h1>
          <p className="text-sm text-slate-500">List an item and start accepting bids</p>
        </div>
      </div>

      <CreateAuctionForm />
    </div>
  )
}
