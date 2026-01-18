'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createTransaction } from '@/actions/escrow'
import { ShieldCheck, Loader2 } from 'lucide-react'

interface EscrowActionsProps {
  listingId: string
  sellerId: string
  buyerId: string
  amount: number
}

export function EscrowActions({ listingId, sellerId, buyerId, amount }: EscrowActionsProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBuySecurely = async () => {
    setIsProcessing(true)

    const result = await createTransaction(buyerId, sellerId, listingId, amount)

    if (result.data) {
      router.push(`/escrow/${result.data.id}`)
    }

    setIsProcessing(false)
  }

  return (
    <div className="border-t pt-4 mt-4">
      <Button
        onClick={handleBuySecurely}
        disabled={isProcessing}
        variant="secondary"
        className="w-full"
        size="lg"
        data-testid="buy-securely-button"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4 mr-2" />
            Buy Securely with Escrow
          </>
        )}
      </Button>
      <p className="text-xs text-center text-muted-foreground mt-2">
        Your funds are protected until you confirm receipt
      </p>
    </div>
  )
}
