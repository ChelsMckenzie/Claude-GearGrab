'use client'

import type { TransactionStatus } from '@/types/database'
import { cn } from '@/lib/utils'
import { CreditCard, ShieldCheck, Truck, CheckCircle } from 'lucide-react'

interface TrustTimelineProps {
  currentStatus: TransactionStatus
}

const steps = [
  {
    id: 'escrow_pending',
    label: 'Payment',
    description: 'Buyer initiates payment',
    icon: CreditCard,
  },
  {
    id: 'funds_secured',
    label: 'Secured',
    description: 'Funds held in escrow',
    icon: ShieldCheck,
  },
  {
    id: 'shipped',
    label: 'Shipped',
    description: 'Seller ships item',
    icon: Truck,
  },
  {
    id: 'completed',
    label: 'Complete',
    description: 'Transaction finalized',
    icon: CheckCircle,
  },
]

const statusOrder = ['escrow_pending', 'funds_secured', 'shipped', 'completed']

export function TrustTimeline({ currentStatus }: TrustTimelineProps) {
  const currentIndex = statusOrder.indexOf(currentStatus)

  return (
    <div className="py-4" data-testid="trust-timeline">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-muted" />
        <div
          className="absolute left-6 top-6 w-0.5 bg-green-500 transition-all duration-500"
          style={{
            height: `${(currentIndex / (steps.length - 1)) * 100}%`,
            maxHeight: 'calc(100% - 48px)',
          }}
        />

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const isCompleted = index <= currentIndex
            const isCurrent = index === currentIndex
            const Icon = step.icon

            return (
              <div
                key={step.id}
                className="relative flex items-start gap-4"
                data-testid={`timeline-step-${step.id}`}
              >
                {/* Icon Circle */}
                <div
                  className={cn(
                    'relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors',
                    isCompleted
                      ? 'bg-green-100 border-green-500 text-green-600'
                      : 'bg-background border-muted text-muted-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="pt-2">
                  <p
                    className={cn(
                      'font-medium',
                      isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                    {isCurrent && (
                      <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
