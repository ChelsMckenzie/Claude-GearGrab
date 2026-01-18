'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { requestContact } from '@/actions/contact'
import { MessageSquare, Loader2 } from 'lucide-react'

interface ContactRequestDialogProps {
  listingId: string
  sellerId: string
  buyerId: string
  onSuccess: () => void
}

export function ContactRequestDialog({
  listingId,
  sellerId,
  buyerId,
  onSuccess,
}: ContactRequestDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const result = await requestContact(listingId, sellerId, buyerId, message)

    setIsSubmitting(false)

    if (result.data) {
      setIsOpen(false)
      setMessage('')
      onSuccess()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg" data-testid="request-contact-button">
          <MessageSquare className="w-4 h-4 mr-2" />
          Request Contact
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Contact Request</DialogTitle>
          <DialogDescription>
            Send a message to the seller. They will be notified and can choose to share their
            contact details with you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Hi, I'm interested in this item..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              data-testid="contact-message-input"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} data-testid="send-request-button">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Request'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
