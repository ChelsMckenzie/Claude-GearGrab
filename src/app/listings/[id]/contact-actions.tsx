'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ContactRequestDialog } from '@/components/marketplace/contact-request-dialog'
import { getContactStatus } from '@/actions/contact'
import { Edit, Phone, Clock, MessageSquare } from 'lucide-react'
import type { ContactRequestStatus } from '@/types/database'
import { createClient } from '@/utils/supabase/client'

interface ContactActionsProps {
  listingId: string
  sellerId: string
  isOwner: boolean
}

export function ContactActions({ listingId, sellerId, isOwner }: ContactActionsProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [contactStatus, setContactStatus] = useState<ContactRequestStatus | null>(null)
  const [sellerPhone, setSellerPhone] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getUser()
  }, [])

  const fetchContactStatus = async () => {
    if (!currentUserId) return
    const result = await getContactStatus(listingId, currentUserId)
    if (result.data) {
      setContactStatus(result.data.status)
      setSellerPhone(result.data.sellerPhone)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (!isOwner && currentUserId) {
      fetchContactStatus()
    } else if (isOwner) {
      setIsLoading(false)
    }
  }, [isOwner, listingId, currentUserId])

  const handleContactRequestSuccess = () => {
    setContactStatus('pending')
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-12 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  // Owner view
  if (isOwner) {
    return (
      <div className="space-y-3">
        <Link href={`/listings/${listingId}/edit`}>
          <Button className="w-full" size="lg" data-testid="edit-listing-button">
            <Edit className="w-4 h-4 mr-2" />
            Edit Listing
          </Button>
        </Link>
      </div>
    )
  }

  // Contact request accepted - show WhatsApp/phone
  if (contactStatus === 'accepted' && sellerPhone) {
    return (
      <div className="space-y-3">
        <a
          href={`https://wa.me/${sellerPhone.replace(/\s+/g, '').replace('+', '')}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" data-testid="whatsapp-button">
            <MessageSquare className="w-4 h-4 mr-2" />
            WhatsApp Seller
          </Button>
        </a>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-4 h-4" />
          <span data-testid="seller-phone">{sellerPhone}</span>
        </div>
      </div>
    )
  }

  // Contact request pending
  if (contactStatus === 'pending') {
    return (
      <div className="space-y-3">
        <Button className="w-full" size="lg" disabled data-testid="pending-button">
          <Clock className="w-4 h-4 mr-2" />
          Request Pending
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Waiting for seller to respond to your contact request
        </p>
      </div>
    )
  }

  // Contact request declined
  if (contactStatus === 'declined') {
    return (
      <div className="space-y-3">
        <Button className="w-full" size="lg" disabled variant="destructive">
          Request Declined
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          The seller has declined your contact request
        </p>
      </div>
    )
  }

  // No contact request yet - show request button
  return (
    <div className="space-y-3">
      {currentUserId && (
        <ContactRequestDialog
          listingId={listingId}
          sellerId={sellerId}
          buyerId={currentUserId}
          onSuccess={handleContactRequestSuccess}
        />
      )}
      <p className="text-sm text-center text-muted-foreground">
        Send a contact request to get the seller&apos;s phone number
      </p>
    </div>
  )
}
