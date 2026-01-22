import { notFound, redirect } from 'next/navigation'
import { getTransaction } from '@/actions/escrow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrustTimeline } from './trust-timeline'
import { EscrowActionButtons } from './escrow-action-buttons'
import { ShieldCheck } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'

interface EscrowPageProps {
  params: Promise<{ id: string }>
}

export default async function EscrowPage({ params }: EscrowPageProps) {
  const { id } = await params

  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const currentUserId = user.id

  const { data: transaction, error } = await getTransaction(id)

  if (error || !transaction) {
    notFound()
  }

  const isBuyer = currentUserId === transaction.buyer_id
  const isSeller = currentUserId === transaction.seller_id

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const statusLabel = {
    escrow_pending: 'Awaiting Payment',
    funds_secured: 'Funds Secured',
    shipped: 'Item Shipped',
    completed: 'Transaction Complete',
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold" data-testid="escrow-title">
            Secure Transaction
          </h1>
          <p className="text-muted-foreground mt-1">
            Transaction ID: {transaction.id}
          </p>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transaction Status</CardTitle>
              <Badge
                className={
                  transaction.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : transaction.status === 'shipped'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }
                data-testid="transaction-status-badge"
              >
                {statusLabel[transaction.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount */}
            <div className="text-center py-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Transaction Amount</p>
              <p className="text-3xl font-bold text-primary" data-testid="escrow-amount">
                {formatPrice(transaction.amount)}
              </p>
              {transaction.status === 'funds_secured' && (
                <p className="text-sm text-green-600 mt-1" data-testid="funds-secured-text">
                  Funds Secured in Escrow
                </p>
              )}
            </div>

            {/* Trust Timeline */}
            <TrustTimeline currentStatus={transaction.status} />

            {/* Action Buttons */}
            <EscrowActionButtons
              transactionId={transaction.id}
              status={transaction.status}
              isBuyer={isBuyer}
              isSeller={isSeller}
            />
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">How Escrow Works</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>1. Buyer pays and funds are secured in escrow</li>
              <li>2. Seller ships the item and confirms shipment</li>
              <li>3. Buyer receives and confirms satisfaction</li>
              <li>4. Funds are released to the seller</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
