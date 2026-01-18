'use client'

import { useState, useOptimistic } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateRequestStatus, type IncomingRequest } from '@/actions/dashboard'
import type { ContactRequestStatus } from '@/types/database'
import { Check, X, Clock, CheckCircle, XCircle, MessageSquare, User } from 'lucide-react'

interface InquiriesTabProps {
  requests: IncomingRequest[]
}

export function InquiriesTab({ requests }: InquiriesTabProps) {
  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No inquiries yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              When buyers request your contact info, they&apos;ll appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4" data-testid="inquiries-grid">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  )
}

interface RequestCardProps {
  request: IncomingRequest
}

function RequestCard({ request }: RequestCardProps) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(request.status)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateStatus = async (newStatus: ContactRequestStatus) => {
    setIsUpdating(true)
    setOptimisticStatus(newStatus)

    await updateRequestStatus(request.id, newStatus)

    setIsUpdating(false)
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-800',
    },
    accepted: {
      icon: CheckCircle,
      label: 'Accepted',
      color: 'bg-green-100 text-green-800',
    },
    declined: {
      icon: XCircle,
      label: 'Declined',
      color: 'bg-red-100 text-red-800',
    },
  }

  const config = statusConfig[optimisticStatus]
  const StatusIcon = config.icon

  return (
    <Card data-testid={`request-card-${request.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {/* Buyer Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>

            {/* Request Details */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium" data-testid={`buyer-name-${request.id}`}>
                  {request.buyerName}
                </span>
                {request.buyerVerified && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-0.5">
                Interested in:{' '}
                <span className="font-medium text-foreground">{request.listingTitle}</span>
              </p>

              {request.message && (
                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm" data-testid={`request-message-${request.id}`}>
                    &quot;{request.message}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <Badge className={config.color} data-testid={`request-status-${request.id}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>

        {/* Action Buttons - only show for pending requests */}
        {optimisticStatus === 'pending' && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <Button
              onClick={() => handleUpdateStatus('accepted')}
              disabled={isUpdating}
              className="flex-1 bg-green-600 hover:bg-green-700"
              data-testid={`accept-request-${request.id}`}
            >
              <Check className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button
              onClick={() => handleUpdateStatus('declined')}
              disabled={isUpdating}
              variant="outline"
              className="flex-1"
              data-testid={`decline-request-${request.id}`}
            >
              <X className="w-4 h-4 mr-2" />
              Decline
            </Button>
          </div>
        )}

        {/* Message for non-pending states */}
        {optimisticStatus === 'accepted' && (
          <p className="text-sm text-green-600 mt-4 pt-4 border-t">
            Your contact details have been shared with this buyer.
          </p>
        )}
        {optimisticStatus === 'declined' && (
          <p className="text-sm text-muted-foreground mt-4 pt-4 border-t">
            You declined this contact request.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
