'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { confirmShipping, confirmReceipt } from '@/actions/escrow'
import type { TransactionStatus } from '@/types/database'
import { Truck, CheckCircle, Loader2 } from 'lucide-react'

interface EscrowActionButtonsProps {
  transactionId: string
  status: TransactionStatus
  isBuyer: boolean
  isSeller: boolean
}

export function EscrowActionButtons({
  transactionId,
  status,
  isBuyer,
  isSeller,
}: EscrowActionButtonsProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirmShipping = async () => {
    setIsProcessing(true)
    await confirmShipping(transactionId)
    router.refresh()
    setIsProcessing(false)
  }

  const handleConfirmReceipt = async () => {
    setIsProcessing(true)
    await confirmReceipt(transactionId)
    router.refresh()
    setIsProcessing(false)
  }

  // Seller can confirm shipping when funds are secured
  if (isSeller && status === 'funds_secured') {
    return (
      <div className="pt-4 border-t">
        <Button
          onClick={handleConfirmShipping}
          disabled={isProcessing}
          className="w-full"
          size="lg"
          data-testid="confirm-shipping-button"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Truck className="w-4 h-4 mr-2" />
              Confirm Shipping
            </>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Click when you have shipped the item
        </p>
      </div>
    )
  }

  // Buyer can confirm receipt when item is shipped
  if (isBuyer && status === 'shipped') {
    return (
      <div className="pt-4 border-t">
        <Button
          onClick={handleConfirmReceipt}
          disabled={isProcessing}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
          data-testid="confirm-receipt-button"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Receipt
            </>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Click when you have received the item and are satisfied
        </p>
      </div>
    )
  }

  // Show status message for other states
  if (status === 'completed') {
    return (
      <div className="pt-4 border-t text-center">
        <div className="inline-flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Transaction Complete</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Funds have been released to the seller
        </p>
      </div>
    )
  }

  // Waiting message for non-action states
  return (
    <div className="pt-4 border-t text-center">
      <p className="text-sm text-muted-foreground">
        {isBuyer && status === 'funds_secured' && 'Waiting for seller to ship the item...'}
        {isSeller && status === 'shipped' && 'Waiting for buyer to confirm receipt...'}
        {!isBuyer && !isSeller && 'You are not part of this transaction'}
      </p>
    </div>
  )
}
