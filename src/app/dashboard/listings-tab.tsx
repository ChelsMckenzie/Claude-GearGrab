'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deleteListing } from '@/actions/dashboard'
import type { Listing } from '@/types/database'
import { Trash2, Eye, Edit, Plus, Loader2 } from 'lucide-react'

interface ListingsTabProps {
  listings: Listing[]
}

export function ListingsTab({ listings }: ListingsTabProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (listingId: string) => {
    setDeletingId(listingId)
    await deleteListing(listingId)
    router.refresh()
    setDeletingId(null)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground mb-4">You haven&apos;t listed any gear yet</p>
          <Link href="/list">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Listing
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {listings.length} listing{listings.length !== 1 ? 's' : ''}
        </p>
        <Link href="/list">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Listing
          </Button>
        </Link>
      </div>

      <div className="grid gap-4" data-testid="listings-grid">
        {listings
          .filter((l) => l.status !== 'hidden')
          .map((listing) => (
            <Card key={listing.id} data-testid={`dashboard-listing-${listing.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Image placeholder */}
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <span className="text-2xl">
                      {listing.category === 'Hiking' ? '🥾' : listing.category === 'Cycling' ? '🚴' : '🎒'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold truncate" data-testid={`listing-title-${listing.id}`}>
                          {listing.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {listing.brand} {listing.model}
                        </p>
                      </div>
                      <Badge
                        variant={listing.status === 'active' ? 'default' : 'secondary'}
                        className="shrink-0"
                      >
                        {listing.status}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-bold text-primary">{formatPrice(listing.price)}</span>

                      <div className="flex items-center gap-2">
                        <Link href={`/listings/${listing.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/listings/${listing.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(listing.id)}
                          disabled={deletingId === listing.id}
                          data-testid={`delete-listing-${listing.id}`}
                        >
                          {deletingId === listing.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
